using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("MultiRoblox Web Setup")]
[assembly: AssemblyDescription("MultiRoblox Lightweight Web Installer")]
[assembly: AssemblyCompany("phwyverysad")]
[assembly: AssemblyProduct("MultiRoblox")]
[assembly: AssemblyCopyright("Copyright (C) 2026")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace MultiRobloxInstaller
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool isSilent = false;
            foreach (string arg in args)
            {
                if (string.Equals(arg, "/S", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(arg, "--silent", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(arg, "-s", StringComparison.OrdinalIgnoreCase))
                {
                    isSilent = true;
                }
            }

            if (isSilent)
            {
                SilentInstall();
                return;
            }

            Application.Run(new InstallerForm());
        }

        static void SilentInstall()
        {
            try
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string installDir = Path.Combine(localApp, @"Programs\MultiRoblox");
                if (!Directory.Exists(installDir)) Directory.CreateDirectory(installDir);

                string exePath = Path.Combine(installDir, "MultiRoblox.exe");
                string localExe = FindLocalExe();

                if (!string.IsNullOrEmpty(localExe) && File.Exists(localExe))
                {
                    File.Copy(localExe, exePath, true);
                }
                else
                {
                    ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                    using (WebClient client = new WebClient())
                    {
                        client.Headers.Add("User-Agent", "MultiRoblox-WebSetup/1.0");
                        string downloadUrl = "https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest/download/MultiRoblox.exe";
                        client.DownloadFile(downloadUrl, exePath);
                    }
                }

                CreateShortcuts(exePath, true);
                RegisterUninstall(installDir, exePath);
            }
            catch {}
        }

        public static string FindLocalExe()
        {
            string currDir = AppDomain.CurrentDomain.BaseDirectory;
            string[] candidates = new string[]
            {
                Path.Combine(currDir, "MultiRoblox.exe"),
                Path.Combine(currDir, @"..\MultiRoblox.exe"),
                Path.Combine(currDir, @"dist\MultiRoblox.exe"),
                Path.Combine(currDir, @"..\dist\MultiRoblox.exe")
            };

            foreach (string c in candidates)
            {
                try
                {
                    if (File.Exists(c)) return Path.GetFullPath(c);
                }
                catch {}
            }
            return null;
        }

        public static void CreateShortcuts(string targetExe, bool desktop)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                dynamic shell = Activator.CreateInstance(shellType);

                // Start Menu shortcut
                string startMenu = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                string startLnk = Path.Combine(startMenu, "MultiRoblox.lnk");
                dynamic s1 = shell.CreateShortcut(startLnk);
                s1.TargetPath = targetExe;
                s1.WorkingDirectory = Path.GetDirectoryName(targetExe);
                s1.Description = "MultiRoblox - Multi-Account Roblox Manager";
                s1.IconLocation = targetExe + ",0";
                s1.Save();

                // Desktop shortcut
                if (desktop)
                {
                    string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    string deskLnk = Path.Combine(desktopDir, "MultiRoblox.lnk");
                    dynamic s2 = shell.CreateShortcut(deskLnk);
                    s2.TargetPath = targetExe;
                    s2.WorkingDirectory = Path.GetDirectoryName(targetExe);
                    s2.Description = "MultiRoblox - Multi-Account Roblox Manager";
                    s2.IconLocation = targetExe + ",0";
                    s2.Save();
                }
            }
            catch {}
        }

        public static void RegisterUninstall(string installDir, string exePath)
        {
            try
            {
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\MultiRoblox"))
                {
                    if (key != null)
                    {
                        key.SetValue("DisplayName", "MultiRoblox");
                        key.SetValue("DisplayVersion", "1.0.0");
                        key.SetValue("Publisher", "phwyverysad");
                        key.SetValue("InstallLocation", installDir);
                        key.SetValue("DisplayIcon", exePath + ",0");
                        key.SetValue("UninstallString", string.Format("cmd.exe /c rd /s /q \"{0}\"", installDir));
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }
            }
            catch {}
        }
    }

    public class InstallerForm : Form
    {
        private Label lblTitle;
        private Label lblSub;
        private Label lblPathHeader;
        private TextBox txtPath;
        private Button btnBrowse;
        private CheckBox chkDesktop;
        private CheckBox chkLaunch;
        private ProgressBar progressBar;
        private Label lblStatus;
        private Button btnInstall;
        private Button btnCancel;
        private Panel pnlHeader;
        private WebClient webClient;
        private Stopwatch stopwatch;
        private bool isFinished = false;

        public InstallerForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "MultiRoblox Web Setup";
            this.Size = new Size(500, 360);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(248, 249, 250);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);

            try
            {
                string currDir = AppDomain.CurrentDomain.BaseDirectory;
                string iconPath = Path.Combine(currDir, @"src\icon.ico");
                if (File.Exists(iconPath)) this.Icon = new Icon(iconPath);
            }
            catch {}

            // Header Panel
            pnlHeader = new Panel();
            pnlHeader.Dock = DockStyle.Top;
            pnlHeader.Height = 76;
            pnlHeader.BackColor = Color.FromArgb(17, 17, 20);

            lblTitle = new Label();
            lblTitle.Text = "MultiRoblox";
            lblTitle.Font = new Font("Segoe UI", 16F, FontStyle.Bold, GraphicsUnit.Point);
            lblTitle.ForeColor = Color.White;
            lblTitle.Location = new Point(20, 14);
            lblTitle.AutoSize = true;

            lblSub = new Label();
            lblSub.Text = "Web Installer v1.0.0 - Fast, Lightweight Setup";
            lblSub.Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);
            lblSub.ForeColor = Color.FromArgb(160, 160, 175);
            lblSub.Location = new Point(22, 45);
            lblSub.AutoSize = true;

            pnlHeader.Controls.Add(lblTitle);
            pnlHeader.Controls.Add(lblSub);
            this.Controls.Add(pnlHeader);

            // Install Path Label
            lblPathHeader = new Label();
            lblPathHeader.Text = "โฟลเดอร์สำหรับติดตั้ง (Installation Path):";
            lblPathHeader.Location = new Point(24, 96);
            lblPathHeader.AutoSize = true;
            lblPathHeader.ForeColor = Color.FromArgb(40, 40, 50);
            this.Controls.Add(lblPathHeader);

            // Path Input
            string defaultPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\MultiRoblox");
            txtPath = new TextBox();
            txtPath.Text = defaultPath;
            txtPath.Location = new Point(24, 120);
            txtPath.Size = new Size(350, 25);
            txtPath.BackColor = Color.White;
            this.Controls.Add(txtPath);

            // Browse Button
            btnBrowse = new Button();
            btnBrowse.Text = "เลือก... (Browse)";
            btnBrowse.Location = new Point(382, 118);
            btnBrowse.Size = new Size(92, 27);
            btnBrowse.UseVisualStyleBackColor = true;
            btnBrowse.Click += BtnBrowse_Click;
            this.Controls.Add(btnBrowse);

            // Options Checkboxes
            chkDesktop = new CheckBox();
            chkDesktop.Text = "สร้างช็อตคัทบนหน้าจอเดสก์ท็อป (Create Desktop Shortcut)";
            chkDesktop.Location = new Point(24, 156);
            chkDesktop.AutoSize = true;
            chkDesktop.Checked = true;
            this.Controls.Add(chkDesktop);

            chkLaunch = new CheckBox();
            chkLaunch.Text = "เปิด MultiRoblox ทันทีเมื่อติดตั้งเสร็จ (Launch MultiRoblox on finish)";
            chkLaunch.Location = new Point(24, 184);
            chkLaunch.AutoSize = true;
            chkLaunch.Checked = true;
            this.Controls.Add(chkLaunch);

            // Progress Bar
            progressBar = new ProgressBar();
            progressBar.Location = new Point(24, 218);
            progressBar.Size = new Size(450, 22);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Visible = false;
            this.Controls.Add(progressBar);

            // Status Label
            lblStatus = new Label();
            lblStatus.Text = "พร้อมเริ่มการติดตั้ง (Ready to install)";
            lblStatus.Location = new Point(24, 246);
            lblStatus.Size = new Size(450, 20);
            lblStatus.ForeColor = Color.FromArgb(80, 80, 95);
            this.Controls.Add(lblStatus);

            // Bottom Buttons
            btnInstall = new Button();
            btnInstall.Text = "ติดตั้ง (Install)";
            btnInstall.Location = new Point(278, 280);
            btnInstall.Size = new Size(100, 32);
            btnInstall.BackColor = Color.FromArgb(92, 92, 224);
            btnInstall.ForeColor = Color.White;
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Font = new Font("Segoe UI", 9F, FontStyle.Bold, GraphicsUnit.Point);
            btnInstall.Cursor = Cursors.Hand;
            btnInstall.Click += BtnInstall_Click;
            this.Controls.Add(btnInstall);

            btnCancel = new Button();
            btnCancel.Text = "ยกเลิก (Cancel)";
            btnCancel.Location = new Point(386, 280);
            btnCancel.Size = new Size(88, 32);
            btnCancel.UseVisualStyleBackColor = true;
            btnCancel.Click += BtnCancel_Click;
            this.Controls.Add(btnCancel);
        }

        private void BtnBrowse_Click(object sender, EventArgs e)
        {
            using (FolderBrowserDialog fbd = new FolderBrowserDialog())
            {
                fbd.Description = "เลือกโฟลเดอร์สำหรับติดตั้ง MultiRoblox";
                fbd.SelectedPath = txtPath.Text;
                if (fbd.ShowDialog() == DialogResult.OK)
                {
                    txtPath.Text = Path.Combine(fbd.SelectedPath, "MultiRoblox");
                }
            }
        }

        private void BtnCancel_Click(object sender, EventArgs e)
        {
            if (webClient != null && webClient.IsBusy)
            {
                webClient.CancelAsync();
            }
            this.Close();
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            if (isFinished)
            {
                if (chkLaunch.Checked)
                {
                    string exePath = Path.Combine(txtPath.Text.Trim(), "MultiRoblox.exe");
                    if (File.Exists(exePath))
                    {
                        Process.Start(new ProcessStartInfo(exePath) { WorkingDirectory = Path.GetDirectoryName(exePath) });
                    }
                }
                this.Close();
                return;
            }

            StartInstall();
        }

        private void StartInstall()
        {
            string installDir = txtPath.Text.Trim();
            if (string.IsNullOrEmpty(installDir))
            {
                MessageBox.Show("กรุณาระบุโฟลเดอร์สำหรับติดตั้ง", "ข้อผิดพลาด", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnInstall.Enabled = false;
            btnBrowse.Enabled = false;
            txtPath.Enabled = false;
            progressBar.Visible = true;
            progressBar.Value = 0;
            lblStatus.Text = "กำลังเตรียมการติดตั้ง...";

            try
            {
                if (!Directory.Exists(installDir)) Directory.CreateDirectory(installDir);

                string targetExe = Path.Combine(installDir, "MultiRoblox.exe");
                string localExe = Program.FindLocalExe();

                if (!string.IsNullOrEmpty(localExe) && File.Exists(localExe))
                {
                    // Local Package Fast Install
                    lblStatus.Text = "พบไฟล์แพ็กเกจในเครื่อง กำลังคัดลอกไฟล์...";
                    progressBar.Value = 50;

                    ThreadPool.QueueUserWorkItem(delegate
                    {
                        try
                        {
                            File.Copy(localExe, targetExe, true);
                            this.Invoke((MethodInvoker)delegate
                            {
                                FinishInstall(installDir, targetExe);
                            });
                        }
                        catch (Exception ex)
                        {
                            this.Invoke((MethodInvoker)delegate
                            {
                                MessageBox.Show("เกิดข้อผิดพลาดในการติดตั้ง: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                                ResetUI();
                            });
                        }
                    });
                }
                else
                {
                    // Online Download Install
                    lblStatus.Text = "กำลังเชื่อมต่อเพื่อดาวน์โหลดเวอร์ชันล่าสุดจากเซิร์ฟเวอร์...";
                    progressBar.Value = 5;

                    ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;

                    string downloadUrl = "https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest/download/MultiRoblox.exe";
                    string tempFile = Path.Combine(Path.GetTempPath(), "MultiRoblox-Setup-Temp.exe");

                    webClient = new WebClient();
                    webClient.Headers.Add("User-Agent", "MultiRoblox-WebSetup/1.0");
                    stopwatch = Stopwatch.StartNew();

                    webClient.DownloadProgressChanged += delegate(object s, DownloadProgressChangedEventArgs ev)
                    {
                        double mbReceived = ev.BytesReceived / 1048576.0;
                        double mbTotal = ev.TotalBytesToReceive / 1048576.0;
                        double speedKb = (ev.BytesReceived / 1024.0) / Math.Max(0.1, stopwatch.Elapsed.TotalSeconds);
                        string speedStr = speedKb > 1024 ? string.Format("{0:0.1} MB/s", speedKb / 1024.0) : string.Format("{0:0} KB/s", speedKb);

                        this.Invoke((MethodInvoker)delegate
                        {
                            progressBar.Value = ev.ProgressPercentage;
                            lblStatus.Text = string.Format("กำลังดาวน์โหลด: {0:0.0} MB / {1:0.0} MB ({2}%) - {3}", mbReceived, mbTotal, ev.ProgressPercentage, speedStr);
                        });
                    };

                    webClient.DownloadFileCompleted += delegate(object s, AsyncCompletedEventArgs ev)
                    {
                        if (ev.Cancelled)
                        {
                            this.Invoke((MethodInvoker)delegate
                            {
                                lblStatus.Text = "ยกเลิกการดาวน์โหลดแล้ว";
                                ResetUI();
                            });
                            return;
                        }

                        if (ev.Error != null)
                        {
                            this.Invoke((MethodInvoker)delegate
                            {
                                MessageBox.Show("ไม่สามารถดาวน์โหลดไฟล์ได้: " + ev.Error.Message, "ดาวน์โหลดล้มเหลว", MessageBoxButtons.OK, MessageBoxIcon.Error);
                                ResetUI();
                            });
                            return;
                        }

                        try
                        {
                            File.Copy(tempFile, targetExe, true);
                            try { File.Delete(tempFile); } catch {}
                            this.Invoke((MethodInvoker)delegate
                            {
                                FinishInstall(installDir, targetExe);
                            });
                        }
                        catch (Exception ex)
                        {
                            this.Invoke((MethodInvoker)delegate
                            {
                                MessageBox.Show("ข้อผิดพลาดในการบันทึกไฟล์: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                                ResetUI();
                            });
                        }
                    };

                    webClient.DownloadFileAsync(new Uri(downloadUrl), tempFile);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("ข้อผิดพลาด: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                ResetUI();
            }
        }

        private void FinishInstall(string installDir, string targetExe)
        {
            progressBar.Value = 100;
            lblStatus.Text = "การติดตั้งเสร็จสมบูรณ์เรียบร้อยแล้ว!";
            lblStatus.ForeColor = Color.FromArgb(26, 158, 98);

            // Copy native helper if available
            try
            {
                string currDir = AppDomain.CurrentDomain.BaseDirectory;
                string helperPath = Path.Combine(currDir, @"src\AntiAFKNative.exe");
                if (File.Exists(helperPath))
                {
                    File.Copy(helperPath, Path.Combine(installDir, "AntiAFKNative.exe"), true);
                }
            }
            catch {}

            // Create shortcuts
            Program.CreateShortcuts(targetExe, chkDesktop.Checked);

            // Register in Windows Add/Remove Programs
            Program.RegisterUninstall(installDir, targetExe);

            isFinished = true;
            btnInstall.Text = "เสร็จสิ้น (Finish)";
            btnInstall.Enabled = true;
            btnCancel.Visible = false;
        }

        private void ResetUI()
        {
            btnInstall.Enabled = true;
            btnBrowse.Enabled = true;
            txtPath.Enabled = true;
            progressBar.Visible = false;
        }
    }
}
