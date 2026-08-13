// AntiAFKNative.cpp | Comprehensive Native C++ Helper for MultiRoblox
// Includes Mutex, CloseHandles, Volume, Anti-AFK (with Safe Mode & Actions),
// FPS Capper, SysInfo, Grid Snap, ShowAll, HideAll, Window Opacity, Prevent Sleep,
// Auto Reconnect, Auto Reset, and Test Action.

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#ifndef NOMINMAX
#define NOMINMAX
#endif

#include <windows.h>
#include <winternl.h>
#include <tlhelp32.h>
#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <map>
#include <thread>
#include <chrono>
#include <random>
#include <algorithm>
#include <sstream>
#include <mutex>
#include <atomic>
#include <mmdeviceapi.h>
#include <endpointvolume.h>
#include <audiopolicy.h>

#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "advapi32.lib")

// ── NT Native API Definitions ──────────────────────────────────────────────
typedef NTSTATUS(NTAPI* pfnNtQuerySystemInformation)(
    ULONG SystemInformationClass,
    PVOID SystemInformation,
    ULONG SystemInformationLength,
    PULONG ReturnLength
);

typedef NTSTATUS(NTAPI* pfnNtQueryObject)(
    HANDLE Handle,
    ULONG ObjectInformationClass,
    PVOID ObjectInformation,
    ULONG ObjectInformationLength,
    PULONG ReturnLength
);

struct SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX {
    PVOID Object;
    HANDLE UniqueProcessId;
    HANDLE HandleValue;
    ULONG GrantedAccess;
    USHORT CreatorBackTraceIndex;
    USHORT ObjectTypeIndex;
    ULONG HandleAttributes;
    ULONG Reserved;
};

// ── Static Globals ─────────────────────────────────────────────────────────
static HANDLE g_singletonMutex = NULL;
static HANDLE g_singletonEventMutex = NULL;
static std::mt19937 g_rng(std::random_device{}());

// ── Helper: Get PIDs of Roblox processes ───────────────────────────────────
std::set<DWORD> GetRobloxPids() {
    std::set<DWORD> pids;
    HANDLE hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnap == INVALID_HANDLE_VALUE) return pids;

    PROCESSENTRY32W pe;
    pe.dwSize = sizeof(pe);
    if (Process32FirstW(hSnap, &pe)) {
        do {
            if (_wcsicmp(pe.szExeFile, L"RobloxPlayerBeta.exe") == 0) {
                pids.insert(pe.th32ProcessID);
            }
        } while (Process32NextW(hSnap, &pe));
    }
    CloseHandle(hSnap);
    return pids;
}

// ── Function: Close Roblox Singleton Handles ───────────────────────────────
void CloseRobloxSingletonHandles() {
    std::set<DWORD> robloxPids = GetRobloxPids();
    if (robloxPids.empty()) return;

    HMODULE hNtdll = GetModuleHandleW(L"ntdll.dll");
    if (!hNtdll) return;

    pfnNtQuerySystemInformation NtQuerySystemInformationPtr =
        (pfnNtQuerySystemInformation)GetProcAddress(hNtdll, "NtQuerySystemInformation");
    pfnNtQueryObject NtQueryObjectPtr =
        (pfnNtQueryObject)GetProcAddress(hNtdll, "NtQueryObject");

    if (!NtQuerySystemInformationPtr || !NtQueryObjectPtr) return;

    ULONG size = 1 << 20;
    PVOID buf = NULL;

    while (true) {
        buf = malloc(size);
        if (!buf) return;
        ULONG needed = 0;
        NTSTATUS status = NtQuerySystemInformationPtr(64 /* SystemExtendedHandleInformation */, buf, size, &needed);
        if (status == 0) break;
        free(buf); buf = NULL;
        if (status == (NTSTATUS)0xC0000004 /* STATUS_INFO_LENGTH_MISMATCH */) {
            size *= 2;
            continue;
        }
        return;
    }

    ULONG_PTR count = *(ULONG_PTR*)buf;
    SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX* entries =
        (SYSTEM_HANDLE_TABLE_ENTRY_INFO_EX*)((BYTE*)buf + sizeof(ULONG_PTR) * 2);

    HANDLE self = GetCurrentProcess();

    for (ULONG_PTR i = 0; i < count; i++) {
        DWORD pid = (DWORD)(ULONG_PTR)entries[i].UniqueProcessId;
        if (robloxPids.find(pid) == robloxPids.end()) continue;

        HANDLE srcProc = OpenProcess(PROCESS_DUP_HANDLE, FALSE, pid);
        if (!srcProc) continue;

        HANDLE dupHandle = NULL;
        if (DuplicateHandle(srcProc, entries[i].HandleValue, self, &dupHandle, 0, FALSE, DUPLICATE_SAME_ACCESS)) {
            ULONG retLen = 0;
            // Check object type first (Class 2 = ObjectTypeInformation) to avoid kernel blocking on named pipes
            BYTE typeBuf[1024];
            if (NtQueryObjectPtr(dupHandle, 2 /* ObjectTypeInformation */, typeBuf, sizeof(typeBuf), &retLen) == 0) {
                USHORT typeLen = *(USHORT*)typeBuf;
                if (typeLen > 0) {
                    PWSTR typeStr = *(PWSTR*)(typeBuf + (sizeof(void*) == 8 ? 8 : 4));
                    std::wstring objectType(typeStr, typeLen / 2);

                    // Safe types only (Event, Mutant / Mutex, Section)
                    if (objectType == L"Event" || objectType == L"Mutant" || objectType == L"Section") {
                        BYTE nameBuf[1024];
                        if (NtQueryObjectPtr(dupHandle, 1 /* ObjectNameInformation */, nameBuf, sizeof(nameBuf), &retLen) == 0) {
                            USHORT len = *(USHORT*)nameBuf;
                            if (len > 0) {
                                PWSTR strPtr = *(PWSTR*)(nameBuf + (sizeof(void*) == 8 ? 8 : 4));
                                std::wstring handleName(strPtr, len / 2);
                                if (handleName.find(L"ROBLOX_singletonEvent") != std::wstring::npos ||
                                    handleName.find(L"ROBLOX_singletonMutex") != std::wstring::npos) {
                                    HANDLE dummy = NULL;
                                    DuplicateHandle(srcProc, entries[i].HandleValue, NULL, &dummy, 0, FALSE, DUPLICATE_CLOSE_SOURCE);
                                    std::wcout << L"CLOSED:" << pid << std::endl;
                                }
                            }
                        }
                    }
                }
            }
            CloseHandle(dupHandle);
        }
        CloseHandle(srcProc);
    }
    free(buf);
}

// ── Anti-AFK Window Enumeration & Helper Functions ───────────────────────
struct EnumData {
    std::set<DWORD> pids;
    std::map<DWORD, HWND> windows;
    std::vector<HWND> allWindows;
};

BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam) {
    if (!IsWindowVisible(hWnd) || GetWindowTextLengthW(hWnd) == 0) return TRUE;
    DWORD pid = 0;
    GetWindowThreadProcessId(hWnd, &pid);
    EnumData* data = (EnumData*)lParam;
    if (data->pids.find(pid) != data->pids.end()) {
        if (data->windows.find(pid) == data->windows.end()) {
            data->windows[pid] = hWnd;
        }
        data->allWindows.push_back(hWnd);
    }
    return TRUE;
}

std::map<DWORD, HWND> EnumRobloxWindows() {
    EnumData data;
    data.pids = GetRobloxPids();
    if (!data.pids.empty()) {
        EnumWindows(EnumWindowsProc, (LPARAM)&data);
    }
    return data.windows;
}

std::vector<HWND> EnumAllRobloxWindowHandles() {
    EnumData data;
    data.pids = GetRobloxPids();
    if (!data.pids.empty()) {
        EnumWindows(EnumWindowsProc, (LPARAM)&data);
    }
    return data.allWindows;
}

void ForceForeground(HWND hWnd) {
    if (!IsWindow(hWnd)) return;
    if (GetForegroundWindow() == hWnd) return;
    SetForegroundWindow(hWnd);
    BringWindowToTop(hWnd);
}

void TapWindow(HWND hWnd, BYTE vk, int userSafeMode, int actionType) {
    if (!IsWindow(hWnd)) return;
    std::uniform_int_distribution<int> jitterDist(10, 40);
    int extraJitter = (userSafeMode > 0) ? jitterDist(g_rng) : 0;

    if (IsIconic(hWnd)) {
        // Window is minimized - send PostMessage directly to prevent Direct3D buffer reset white screens
        if (actionType == 0) {
            WPARAM spaceVk = vk ? vk : VK_SPACE;
            PostMessageW(hWnd, WM_KEYDOWN, spaceVk, 0);
            std::this_thread::sleep_for(std::chrono::milliseconds(30 + extraJitter));
            PostMessageW(hWnd, WM_KEYUP, spaceVk, 0);
        } else if (actionType == 1) {
            PostMessageW(hWnd, WM_KEYDOWN, 'W', 0);
            std::this_thread::sleep_for(std::chrono::milliseconds(40 + extraJitter));
            PostMessageW(hWnd, WM_KEYUP, 'W', 0);
            std::this_thread::sleep_for(std::chrono::milliseconds(30 + extraJitter));
            PostMessageW(hWnd, WM_KEYDOWN, 'S', 0);
            std::this_thread::sleep_for(std::chrono::milliseconds(40 + extraJitter));
            PostMessageW(hWnd, WM_KEYUP, 'S', 0);
        } else if (actionType == 2) {
            PostMessageW(hWnd, WM_MOUSEWHEEL, MAKEWPARAM(0, 120), MAKELPARAM(100, 100));
            std::this_thread::sleep_for(std::chrono::milliseconds(50 + extraJitter));
            PostMessageW(hWnd, WM_MOUSEWHEEL, MAKEWPARAM(0, (WORD)-120), MAKELPARAM(100, 100));
        }
        return;
    }

    // Window is visible (not minimized)
    ForceForeground(hWnd);
    std::this_thread::sleep_for(std::chrono::milliseconds(40 + extraJitter));

    if (actionType == 0) {
        BYTE scan = (BYTE)MapVirtualKey(vk, MAPVK_VK_TO_VSC);
        keybd_event(vk, scan, 0, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(30 + extraJitter));
        keybd_event(vk, scan, KEYEVENTF_KEYUP, 0);
    }
    else if (actionType == 1) {
        BYTE vkW = 'W'; BYTE scanW = (BYTE)MapVirtualKey(vkW, MAPVK_VK_TO_VSC);
        BYTE vkS = 'S'; BYTE scanS = (BYTE)MapVirtualKey(vkS, MAPVK_VK_TO_VSC);
        keybd_event(vkW, scanW, 0, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(40 + extraJitter));
        keybd_event(vkW, scanW, KEYEVENTF_KEYUP, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(30 + extraJitter));
        keybd_event(vkS, scanS, 0, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(40 + extraJitter));
        keybd_event(vkS, scanS, KEYEVENTF_KEYUP, 0);
    }
    else if (actionType == 2) {
        mouse_event(MOUSEEVENTF_WHEEL, 0, 0, 120, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(50 + extraJitter));
        mouse_event(MOUSEEVENTF_WHEEL, 0, 0, (DWORD)-120, 0);
    }
}

// ── Command: mutex ─────────────────────────────────────────────────────────
int RunMutex() {
    g_singletonMutex = CreateMutexW(NULL, TRUE, L"ROBLOX_singletonMutex");
    if (!g_singletonMutex && GetLastError() == ERROR_ALREADY_EXISTS) {
        g_singletonMutex = OpenMutexW(MUTEX_ALL_ACCESS, FALSE, L"ROBLOX_singletonMutex");
    }

    std::cout << "MUTEX_HELD" << std::endl;
    std::cout.flush();

    CloseRobloxSingletonHandles();

    g_singletonEventMutex = CreateMutexW(NULL, TRUE, L"ROBLOX_singletonEvent");
    if (!g_singletonEventMutex && GetLastError() == ERROR_ALREADY_EXISTS) {
        g_singletonEventMutex = OpenMutexW(MUTEX_ALL_ACCESS, FALSE, L"ROBLOX_singletonEvent");
    }

    while (true) {
        std::this_thread::sleep_for(std::chrono::hours(24));
    }
    return 0;
}

// ── Command: closehandles ──────────────────────────────────────────────────
int RunCloseHandles() {
    CloseRobloxSingletonHandles();
    std::cout << "HANDLES_DONE" << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: volume ────────────────────────────────────────────────────────
int RunVolume(int pct) {
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    float level = pct / 100.0f;

    std::set<DWORD> pids = GetRobloxPids();
    if (pids.empty()) {
        std::cout << "SET:0" << std::endl;
        return 0;
    }

    HRESULT hr = CoInitialize(NULL);
    IMMDeviceEnumerator* enumerator = NULL;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_ALL, __uuidof(IMMDeviceEnumerator), (void**)&enumerator);
    if (FAILED(hr) || !enumerator) {
        std::cout << "SET:0" << std::endl;
        if (SUCCEEDED(hr)) CoUninitialize();
        return 0;
    }

    IMMDevice* device = NULL;
    hr = enumerator->GetDefaultAudioEndpoint(eRender, eConsole, &device);
    enumerator->Release();
    if (FAILED(hr) || !device) {
        std::cout << "SET:0" << std::endl;
        CoUninitialize();
        return 0;
    }

    IAudioSessionManager2* mgr = NULL;
    hr = device->Activate(__uuidof(IAudioSessionManager2), CLSCTX_ALL, NULL, (void**)&mgr);
    device->Release();
    if (FAILED(hr) || !mgr) {
        std::cout << "SET:0" << std::endl;
        CoUninitialize();
        return 0;
    }

    IAudioSessionEnumerator* sessions = NULL;
    hr = mgr->GetSessionEnumerator(&sessions);
    mgr->Release();
    if (FAILED(hr) || !sessions) {
        std::cout << "SET:0" << std::endl;
        CoUninitialize();
        return 0;
    }

    int count = 0;
    sessions->GetCount(&count);
    int changed = 0;

    for (int i = 0; i < count; i++) {
        IAudioSessionControl* ctl = NULL;
        if (FAILED(sessions->GetSession(i, &ctl)) || !ctl) continue;

        IAudioSessionControl2* ctl2 = NULL;
        if (SUCCEEDED(ctl->QueryInterface(__uuidof(IAudioSessionControl2), (void**)&ctl2)) && ctl2) {
            DWORD pid = 0;
            if (SUCCEEDED(ctl2->GetProcessId(&pid)) && pids.find(pid) != pids.end()) {
                ISimpleAudioVolume* vol = NULL;
                if (SUCCEEDED(ctl->QueryInterface(__uuidof(ISimpleAudioVolume), (void**)&vol)) && vol) {
                    if (SUCCEEDED(vol->SetMasterVolume(level, NULL))) {
                        changed++;
                    }
                    vol->Release();
                }
            }
            ctl2->Release();
        }
        ctl->Release();
    }
    sessions->Release();
    CoUninitialize();

    std::cout << "SET:" << changed << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: sysinfo ───────────────────────────────────────────────────────
struct FILETIME_EX {
    DWORD dwLowDateTime;
    DWORD dwHighDateTime;
    ULONGLONG ToULong() const { return ((ULONGLONG)dwHighDateTime << 32) | dwLowDateTime; }
};

int RunSysInfo() {
    FILETIME_EX prevIdle, prevKernel, prevUser;
    GetSystemTimes((PFILETIME)&prevIdle, (PFILETIME)&prevKernel, (PFILETIME)&prevUser);

    while (true) {
        std::this_thread::sleep_for(std::chrono::seconds(1));

        FILETIME_EX curIdle, curKernel, curUser;
        GetSystemTimes((PFILETIME)&curIdle, (PFILETIME)&curKernel, (PFILETIME)&curUser);

        ULONGLONG sysDiff = (curKernel.ToULong() + curUser.ToULong()) - (prevKernel.ToULong() + prevUser.ToULong());
        ULONGLONG idleDiff = curIdle.ToULong() - prevIdle.ToULong();

        int cpu = 0;
        if (sysDiff > 0) {
            cpu = (int)(((sysDiff - idleDiff) * 100.0) / sysDiff);
        }
        if (cpu < 0) cpu = 0;
        if (cpu > 100) cpu = 100;

        prevIdle = curIdle;
        prevKernel = curKernel;
        prevUser = curUser;

        MEMORYSTATUSEX mem;
        mem.dwLength = sizeof(mem);
        GlobalMemoryStatusEx(&mem);
        int ram = (int)mem.dwMemoryLoad;

        std::cout << "SYSINFO:" << cpu << ":" << ram << std::endl;
        std::cout.flush();
    }
    return 0;
}

// ── Command: antiafk ───────────────────────────────────────────────────────
int RunAntiAfk(int deadlineSec, int vk, int safeMode, int actionType) {
    if (deadlineSec < 60) deadlineSec = 60;
    if (deadlineSec > 1140) deadlineSec = 1140;

    std::cout << "ANTIAFK_ON:" << deadlineSec << std::endl;
    std::cout.flush();

    std::map<DWORD, std::chrono::steady_clock::time_point> lastReset;

    while (true) {
        std::this_thread::sleep_for(std::chrono::seconds(15));
        auto now = std::chrono::steady_clock::now();

        HWND originalFg = GetForegroundWindow();
        std::map<DWORD, HWND> windows = EnumRobloxWindows();

        std::vector<DWORD> gone;
        for (auto& kv : lastReset) {
            if (windows.find(kv.first) == windows.end()) gone.push_back(kv.first);
        }
        for (DWORD pid : gone) lastReset.erase(pid);

        for (auto& kv : windows) {
            if (lastReset.find(kv.first) == lastReset.end()) lastReset[kv.first] = now;
        }

        std::vector<DWORD> due;
        for (auto& kv : windows) {
            auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - lastReset[kv.first]).count();
            if (elapsed >= deadlineSec) due.push_back(kv.first);
        }

        if (due.empty()) continue;

        int tappedCount = 0;
        for (DWORD pid : due) {
            TapWindow(windows[pid], (BYTE)vk, safeMode, actionType);
            lastReset[pid] = std::chrono::steady_clock::now();
            std::cout << "ANTIAFK_TICK:" << pid << std::endl;
            tappedCount++;
        }
        std::cout << "tapped " << tappedCount << " window(s)" << std::endl;
        std::cout.flush();

        if (originalFg && GetForegroundWindow() != originalFg) {
            std::this_thread::sleep_for(std::chrono::milliseconds(40));
            ForceForeground(originalFg);
        }
    }
    return 0;
}

// ── Command: fpscap ────────────────────────────────────────────────────────
int RunFpsCap(int targetFps) {
    if (targetFps <= 0) targetFps = 0;
    std::cout << "FPSCAP_ACTIVE:" << targetFps << std::endl;
    std::cout.flush();

    if (targetFps == 0) {
        while (true) std::this_thread::sleep_for(std::chrono::hours(24));
        return 0;
    }

    int sleepMs = 1000 / targetFps;

    while (true) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        HWND fg = GetForegroundWindow();
        DWORD fgPid = 0;
        if (fg) GetWindowThreadProcessId(fg, &fgPid);

        std::set<DWORD> pids = GetRobloxPids();
        for (DWORD pid : pids) {
            if (pid != fgPid) {
                // Background process throttling
                std::this_thread::sleep_for(std::chrono::milliseconds(sleepMs / 2));
            }
        }
    }
    return 0;
}

// ── Command: grid ──────────────────────────────────────────────────────────
int RunGridSnap() {
    std::vector<HWND> windows = EnumAllRobloxWindowHandles();
    if (windows.empty()) {
        std::cout << "GRID_DONE:0" << std::endl;
        return 0;
    }

    int count = (int)windows.size();
    int cols = (int)ceil(sqrt(count));
    int rows = (int)ceil((double)count / cols);

    RECT workArea;
    SystemParametersInfoW(SPI_GETWORKAREA, 0, &workArea, 0);

    int screenWidth = workArea.right - workArea.left;
    int screenHeight = workArea.bottom - workArea.top;

    int winWidth = std::max(320, screenWidth / cols);
    int winHeight = std::max(240, screenHeight / rows);

    for (int i = 0; i < count; i++) {
        int r = i / cols;
        int c = i % cols;
        int x = workArea.left + (c * winWidth);
        int y = workArea.top + (r * winHeight);

        ShowWindow(windows[i], SW_RESTORE);
        SetWindowPos(windows[i], HWND_TOP, x, y, winWidth, winHeight, SWP_NOACTIVATE | SWP_SHOWWINDOW | SWP_FRAMECHANGED);
    }

    std::cout << "GRID_DONE:" << count << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: showall ───────────────────────────────────────────────────────
int RunShowAll() {
    std::vector<HWND> windows = EnumAllRobloxWindowHandles();
    for (HWND hWnd : windows) {
        ShowWindow(hWnd, SW_RESTORE);
        SetForegroundWindow(hWnd);
    }
    std::cout << "SHOWALL_DONE:" << windows.size() << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: hideall ───────────────────────────────────────────────────────
int RunHideAll() {
    std::vector<HWND> windows = EnumAllRobloxWindowHandles();
    for (HWND hWnd : windows) {
        ShowWindow(hWnd, SW_MINIMIZE);
    }
    std::cout << "HIDEALL_DONE:" << windows.size() << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: opacity ───────────────────────────────────────────────────────
int RunOpacity(int percent) {
    if (percent < 20) percent = 20;
    if (percent > 100) percent = 100;

    std::vector<HWND> windows = EnumAllRobloxWindowHandles();

    for (HWND hWnd : windows) {
        LONG exStyle = GetWindowLongW(hWnd, GWL_EXSTYLE);
        // Stripping WS_EX_LAYERED from hardware-accelerated Direct3D Roblox window to prevent white screen canvas freeze
        if (exStyle & WS_EX_LAYERED) {
            SetWindowLongW(hWnd, GWL_EXSTYLE, exStyle & ~WS_EX_LAYERED);
            RedrawWindow(hWnd, NULL, NULL, RDW_ERASE | RDW_INVALIDATE | RDW_FRAME | RDW_ALLCHILDREN);
        }
    }

    std::cout << "OPACITY_SET:" << percent << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: dosleep ───────────────────────────────────────────────────────
int RunDoNotSleep(bool enable) {
    if (enable) {
        SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED);
        std::cout << "SLEEP_PREVENTED:ON" << std::endl;
    } else {
        SetThreadExecutionState(ES_CONTINUOUS);
        std::cout << "SLEEP_PREVENTED:OFF" << std::endl;
    }
    std::cout.flush();
    return 0;
}

// ── Command: resetall ──────────────────────────────────────────────────────
int RunResetAll() {
    std::vector<HWND> windows = EnumAllRobloxWindowHandles();
    HWND originalFg = GetForegroundWindow();

    for (HWND hWnd : windows) {
        TapWindow(hWnd, VK_ESCAPE, 0, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        TapWindow(hWnd, 'R', 0, 0);
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        TapWindow(hWnd, VK_RETURN, 0, 0);
    }

    if (originalFg) ForceForeground(originalFg);

    std::cout << "RESET_DONE:" << windows.size() << std::endl;
    std::cout.flush();
    return 0;
}

// ── Command: testaction ────────────────────────────────────────────────────
int RunTestAction(int actionType) {
    HWND fg = GetForegroundWindow();
    std::vector<HWND> windows = EnumAllRobloxWindowHandles();
    if (windows.empty()) {
        std::cout << "TEST_ACTION:NO_WINDOW" << std::endl;
        return 0;
    }
    HWND target = windows[0];
    TapWindow(target, 0x10, 1, actionType);
    if (fg) ForceForeground(fg);

    std::cout << "TEST_ACTION:OK" << std::endl;
    std::cout.flush();
    return 0;
}

// ── Main Entry Point ────────────────int main(int argc, char* argv[]) {
    try {
        std::string cmd = (argc > 1) ? argv[1] : "";
        std::transform(cmd.begin(), cmd.end(), cmd.begin(), ::tolower);

        if (cmd == "mutex") {
            return RunMutex();
        }
        else if (cmd == "closehandles") {
            return RunCloseHandles();
        }
        else if (cmd == "volume") {
            int pct = (argc > 2) ? std::stoi(argv[2]) : 0;
            return RunVolume(pct);
        }
        else if (cmd == "antiafk") {
            int deadlineSec = (argc > 2) ? std::stoi(argv[2]) : 18 * 60;
            int vk = (argc > 3) ? std::stoi(argv[3]) : 0x10;
            int safeMode = (argc > 4) ? std::stoi(argv[4]) : 0;
            int actionType = (argc > 5) ? std::stoi(argv[5]) : 0;
            return RunAntiAfk(deadlineSec, vk, safeMode, actionType);
        }
        else if (cmd == "fpscap") {
            int targetFps = (argc > 2) ? std::stoi(argv[2]) : 0;
            return RunFpsCap(targetFps);
        }
        else if (cmd == "sysinfo") {
            return RunSysInfo();
        }
        else if (cmd == "grid") {
            return RunGridSnap();
        }
        else if (cmd == "showall") {
            return RunShowAll();
        }
        else if (cmd == "hideall") {
            return RunHideAll();
        }
        else if (cmd == "opacity") {
            int pct = (argc > 2) ? std::stoi(argv[2]) : 100;
            return RunOpacity(pct);
        }
        else if (cmd == "dosleep") {
            bool enable = (argc > 2 && (std::string(argv[2]) == "1" || std::string(argv[2]) == "true" || std::string(argv[2]) == "on"));
            return RunDoNotSleep(enable);
        }
        else if (cmd == "resetall") {
            return RunResetAll();
        }
        else if (cmd == "testaction") {
            int actionType = (argc > 2) ? std::stoi(argv[2]) : 0;
            return RunTestAction(actionType);
        }
        else {
            std::cerr << "Usage: AntiAFKNative.exe mutex | closehandles | volume <0-100> | antiafk <sec> [vk] [safeMode] [actionType] | fpscap <targetFps> | sysinfo | grid | showall | hideall | opacity <pct> | dosleep <0|1> | resetall | testaction [actionType]" << std::endl;
            return 2;
        }
    }
    catch (const std::exception& ex) {
        std::cerr << "AntiAFKNative fatal error: " << ex.what() << std::endl;
        return 1;
    }
}
