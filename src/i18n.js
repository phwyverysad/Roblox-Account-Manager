// ============================================================================
// MultiRoblox - Internationalization (i18n) Engine
// Strict Zero-Leakage Multi-Language Dictionary & Helpers
// Supported Languages: th (Thai - default), en (English), ja (Japanese), zh (Chinese), ko (Korean), es (Spanish)
// ============================================================================

(function () {

const LANG_OPTIONS = {
  th: { label: 'ไทย', badge: 'TH', desc: 'ภาษาเริ่มต้นของโปรแกรม' },
  en: { label: 'English', badge: 'EN', desc: 'English interface' },
  ja: { label: '日本語', badge: 'JP', desc: '日本語インターフェース' },
  zh: { label: '中文', badge: 'ZH', desc: '中文界面' },
  ko: { label: '한국어', badge: 'KR', desc: '한국어 인터페이스' },
  es: { label: 'Español', badge: 'ES', desc: 'Interfaz en español' }
};

let _currentLanguage = 'th';

const TEXT_MAP = {
  "')\">ปรับใช้ <button": {
    "en": "Apply",
    "ja": "適用",
    "zh": "应用",
    "ko": "적용",
    "es": "Aplicar"
  },
  "')\">ลบ": {
    "en": "Delete",
    "ja": "削除",
    "zh": "删除",
    "ko": "삭제",
    "es": "Eliminar"
  },
  "0 บัญชี": {
    "en": "0 accounts",
    "ja": "0 アカウント",
    "zh": "0 个账户",
    "ko": "0개 계정",
    "es": "0 cuentas"
  },
  "{0} บัญชี": {
    "en": "{0} accounts",
    "ja": "{0} アカウント",
    "zh": "{0} 个账户",
    "ko": "{0}개 계정",
    "es": "{0} cuentas"
  },
  "11 นาที": {
    "en": "11 Minutes",
    "ja": "11分",
    "zh": "11 分钟",
    "ko": "11분",
    "es": "11 minutos"
  },
  "13 นาที": {
    "en": "13 Minutes",
    "ja": "13分",
    "zh": "13 分钟",
    "ko": "13분",
    "es": "13 minutos"
  },
  "15 นาที": {
    "en": "15 Minutes",
    "ja": "15分",
    "zh": "15 分钟",
    "ko": "15분",
    "es": "15 minutos"
  },
  "18 นาที": {
    "en": "18 Minutes",
    "ja": "18分",
    "zh": "18 分钟",
    "ko": "18분",
    "es": "18 minutos"
  },
  "2 จอ (ซ้าย-ขวา)": {
    "en": "2 Displays (Left-Right)",
    "ja": "2画面 (左右)",
    "zh": "双屏 (左-右)",
    "ko": "2화면 (좌-우)",
    "es": "2 Pantallas (Izq-Der)"
  },
  "2 วินาที": {
    "en": "2 Seconds",
    "ja": "2秒",
    "zh": "2 秒",
    "ko": "2초",
    "es": "2 segundos"
  },
  "3 นาที": {
    "en": "3 Minutes",
    "ja": "3分",
    "zh": "3 分钟",
    "ko": "3분",
    "es": "3 minutos"
  },
  "4 จอ (2x2)": {
    "en": "4 Displays (2x2)",
    "ja": "4画面 (2x2)",
    "zh": "四屏 (2x2)",
    "ko": "4화면 (2x2)",
    "es": "4 Pantallas (2x2)"
  },
  "6 จอ (3x2)": {
    "en": "6 Displays (3x2)",
    "ja": "6画面 (3x2)",
    "zh": "六屏 (3x2)",
    "ko": "6화면 (3x2)",
    "es": "6 Pantallas (3x2)"
  },
  "6 นาที": {
    "en": "6 Minutes",
    "ja": "6分",
    "zh": "6 分钟",
    "ko": "6분",
    "es": "6 minutos"
  },
  "9 นาที (แนะนำ)": {
    "en": "9 Minutes (Recommended)",
    "ja": "9分 (推奨)",
    "zh": "9 分钟 (推荐)",
    "ko": "9분 (권장)",
    "es": "9 minutos (Recomendado)"
  },
  "กดปุ่ม Reconnect อัตโนมัติเมื่อหลุดจากเซิร์ฟเวอร์": {
    "en": "Auto clicks Reconnect button when disconnected from server",
    "ja": "サーバー切断時に自動で再接続ボタンをクリック",
    "zh": "掉线时自动点击重新连接按钮",
    "ko": "서버 연결 끊김 시 자동으로 재연결 버튼 클릭",
    "es": "Pulsa reconectar automáticamente al desconectarse del servidor"
  },
  "กดสร้างเพื่อสร้างบัญชี": {
    "en": "Click Generate to create an account",
    "ja": "「生成」をクリックしてアカウントを作成します",
    "zh": "点击生成以创建账户",
    "ko": "계정을 생성하려면 생성을 클릭하세요",
    "es": "Haz clic en Generar para crear una cuenta"
  },
  "กรอกคีย์เข้ารหัส": {
    "en": "Enter Encryption Key",
    "ja": "暗号化キーを入力",
    "zh": "输入加密密钥",
    "ko": "암호화 키 입력",
    "es": "Introducir clave de cifrado"
  },
  "กรอกคีย์ที่ตั้งไว้เพื่อปลดล็อกบัญชีที่บันทึกไว้": {
    "en": "Enter your set key to unlock saved accounts",
    "ja": "設定したキーを入力して保存されたアカウントをロック解除",
    "zh": "输入设置的密钥以解锁保存的账户",
    "ko": "저장된 계정을 잠금 해제하려면 설정한 키를 입력하세요",
    "es": "Introduce tu clave para desbloquear las cuentas guardadas"
  },
  "กรอก BloxGen API key ที่ถูกต้อง (ต้องขึ้นต้นด้วย BLOX-)": {
    "en": "Enter a valid BloxGen API key (must start with BLOX-)",
    "ja": "有効な BloxGen API キーを入力してください (BLOX- で始まる必要があります)",
    "zh": "请输入有效的 BloxGen API 密钥 (必须以 BLOX- 开头)",
    "ko": "유효한 BloxGen API 키를 입력하세요 (BLOX- 로 시작해야 함)",
    "es": "Introduce una clave API de BloxGen válida (debe empezar por BLOX-)"
  },
  "กระโดด (Spacebar Jump)": {
    "en": "Spacebar Jump",
    "ja": "スペースキージャンプ (Spacebar Jump)",
    "zh": "空格键跳跃 (Spacebar Jump)",
    "ko": "스페이스바 점프 (Spacebar Jump)",
    "es": "Salto con barra espaciadora"
  },
  "กราฟิกและการเรนเดอร์ (Rendering & Graphics)": {
    "en": "Rendering & Graphics",
    "ja": "レンダリングとグラフィックス (Rendering & Graphics)",
    "zh": "渲染与图形 (Rendering & Graphics)",
    "ko": "렌더링 및 그래픽 (Rendering & Graphics)",
    "es": "Renderizado y Gráficos (Rendering & Graphics)"
  },
  "กราฟิกและเสียง": {
    "en": "Graphics & Audio",
    "ja": "グラフィックとサウンド",
    "zh": "图形与音频",
    "ko": "그래픽 및 오디오",
    "es": "Gráficos y Sonido"
  },
  "กราฟิก FPS และเสียงสำหรับแต่ละอินสแตนซ์": {
    "en": "Graphics, FPS, and volume for each instance",
    "ja": "各インスタンスのグラフィック、FPS、音量",
    "zh": "每个实例 division 的图形、FPS 和音量",
    "ko": "각 인스턴스의 그래픽, FPS 및 볼륨",
    "es": "Gráficos, FPS y volumen de cada instancia"
  },
  "กราไฟต์": {
    "en": "Graphite",
    "ja": "グラファイト",
    "zh": "石墨灰",
    "ko": "흑연색",
    "es": "Grafito"
  },
  "กรุณากรอกคีย์เข้ารหัส": {
    "en": "Please enter encryption key",
    "ja": "暗号化キーを入力してください",
    "zh": "请输入加密密钥",
    "ko": "암호화 키를 입력하세요",
    "es": "Por favor introduzca la clave de cifrado"
  },
  "กรุณากรอกคีย์เข้ารหัสของคุณ": {
    "en": "Please enter your encryption key",
    "ja": "暗号化キーを入力してください",
    "zh": "请输入您的加密密钥",
    "ko": "암호화 키를 입력하세요",
    "es": "Por favor introduzca su clave de cifrado"
  },
  "กรุณากรอกรหัส Version Hash ก่อนกดติดตั้ง": {
    "en": "Please enter Version Hash before installing",
    "ja": "インストール前に Version Hash を入力してください",
    "zh": "安装前请输入 Version Hash 代码",
    "ko": "설치하기 전에 Version Hash 코드를 입력하세요",
    "es": "Por favor introduce el Version Hash antes de instalar"
  },
  "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือใช้วิธีวางคุกกี้": {
    "en": "Please check your internet connection or use \"Paste Cookie\"",
    "ja": "インターネット接続を確認するか、「クッキー貼り付け」を使用してください",
    "zh": "请检查网络连接或使用“粘贴 Cookie”方式",
    "ko": "인터넷 연결을 확인하거나 \"쿠키 붙여넣기\"를 사용하세요",
    "es": "Comprueba tu conexión a internet o usa \"Pegar cookie\""
  },
  "กรุณาตั้งชื่อกลุ่ม": {
    "en": "Please enter a package name",
    "ja": "グループ名を入力してください",
    "zh": "请输入群组名称",
    "ko": "그룹 이름을 입력하세요",
    "es": "Por favor introduzca un nombre para el grupo"
  },
  "กรุณาระบุชื่อโปรไฟล์": {
    "en": "Please enter a profile name",
    "ja": "プロファイル名を入力してください",
    "zh": "请输入配置文件名称",
    "ko": "프로필 이름을 입력하세요",
    "es": "Por favor introduce un nombre de perfil"
  },
  "กรุณาระบุชื่อ Flag": {
    "en": "Please specify a Flag name",
    "ja": "Flag 名を指定してください",
    "zh": "请指定 Flag 名称",
    "ko": "Flag 이름을 지정하세요",
    "es": "Por favor especifica un nombre de Flag"
  },
  "กรุณาลองอีกครั้งในสักครู่": {
    "en": "Please try again shortly",
    "ja": "しばらくしてからもう一度お試しください",
    "zh": "请稍后再试",
    "ko": "잠시 후 다시 시도해 주세요",
    "es": "Por favor inténtalo de nuevo en unos momentos"
  },
  "กรุณาเลือกบัญชีอย่างน้อยหนึ่งบัญชี": {
    "en": "Please select at least one account",
    "ja": "少なくとも1つのアカウントを選択してください",
    "zh": "请少なくとも1つのアカウントを選択してください",
    "ko": "적어도 하나의 계정을 선택하세요",
    "es": "Por favor selecciona al menos una cuenta"
  },
  "กรุณาเลือก FastFlag ที่ต้องการลบก่อน": {
    "en": "Please select FastFlags to delete first",
    "ja": "まず削除する FastFlag を選択してください",
    "zh": "请先选择要删除的 FastFlag",
    "ko": "삭제할 FastFlag를 먼저 선택하세요",
    "es": "Por favor selecciona primero los FastFlags que deseas eliminar"
  },
  "กรุณาใส่ Place ID ของเกม": {
    "en": "Please enter Game Place ID",
    "ja": "ゲームの Place ID を入力してください",
    "zh": "请输入游戏 Place ID",
    "ko": "게임 Place ID를 입력하세요",
    "es": "Por favor introduce el Place ID del juego"
  },
  "กลับ": {
    "en": "Back",
    "ja": "戻る",
    "zh": "返回",
    "ko": "뒤로",
    "es": "Volver"
  },
  "กลับไปที่ตาราง": {
    "en": "Back to Table",
    "ja": "テーブルに戻る",
    "zh": "返回表格",
    "ko": "표로 돌아가기",
    "es": "Volver a la tabla"
  },
  "กลุ่ม": {
    "en": "Packages",
    "ja": "グループ",
    "zh": "群组",
    "ko": "그룹",
    "es": "Grupos"
  },
  "(กลุ่ม)": {
    "en": "(Package)",
    "ja": "(グループ)",
    "zh": "(群组)",
    "ko": "(그룹)",
    "es": "(Grupo)"
  },
  "(กลุ่ม)...": {
    "en": "(Package)...",
    "ja": "(グループ)...",
    "zh": "(群组)...",
    "ko": "(그룹)...",
    "es": "(Grupo)..."
  },
  "กลุ่มนี้ยังไม่มีบัญชี": {
    "en": "This package has no accounts yet",
    "ja": "このグループにはまだアカウントがありません",
    "zh": "此群组暂无账户",
    "ko": "이 그룹에는 아직 계정이 없습니다",
    "es": "Este grupo no tiene cuentas todavía"
  },
  "กลุ่มใหม่": {
    "en": "New Package",
    "ja": "新規グループ",
    "zh": "新群组",
    "ko": "새 그룹",
    "es": "Nuevo Grupo"
  },
  "กว้าง": {
    "en": "Width",
    "ja": "幅",
    "zh": "宽度",
    "ko": "너비",
    "es": "Ancho"
  },
  "กว้าง (W)": {
    "en": "Width (W)",
    "ja": "幅 (W)",
    "zh": "宽度 (W)",
    "ko": "너비 (W)",
    "es": "Ancho (W)"
  },
  "กัน AFK": {
    "en": "Anti-AFK",
    "ja": "放置防止",
    "zh": "防挂机",
    "ko": "AFK 방지",
    "es": "Anti-AFK"
  },
  "การกระทำนี้ไม่สามารถย้อนกลับได้": {
    "en": "This action cannot be undone.",
    "ja": "この操作は元に戻せません。",
    "zh": "此操作不可撤销。",
    "ko": "이 작업은 취소할 수 없습니다.",
    "es": "Esta acción no se puede deshacer."
  },
  "การเข้ารหัส": {
    "en": "Encryption",
    "ja": "暗号化",
    "zh": "加密方式",
    "ko": "암호화",
    "es": "Cifrado"
  },
  "การจัดวางหน้าต่างและความโปร่งใส (Window & Grid)": {
    "en": "Window & Grid Layout",
    "ja": "ウィンドウとグリッド配置 (Window & Grid)",
    "zh": "窗口与网格布局 (Window & Grid)",
    "ko": "창 및 그리드 레이아웃 (Window & Grid)",
    "es": "Disposición de ventanas y cuadrícula"
  },
  "การแจ้งเตือนผ่าน Discord Webhook": {
    "en": "Discord Webhook Notifications",
    "ja": "Discord Webhook 通知",
    "zh": "Discord Webhook 通知",
    "ko": "Discord Webhook 알림",
    "es": "Notificaciones por Discord Webhook"
  },
  "การเชื่อมต่อและสถานะ (Discord RPC Connection)": {
    "en": "Discord RPC Connection & Status",
    "ja": "Discord RPC 接続とステータス",
    "zh": "Discord RPC 连接与状态",
    "ko": "Discord RPC 연결 및 상태",
    "es": "Conexión y estado de Discord RPC"
  },
  "การตั้งค่า": {
    "en": "Settings",
    "ja": "設定",
    "zh": "设置",
    "ko": "설정",
    "es": "Configuración"
  },
  "การตั้งหน่วงเวลาเปิดบัญชี (Launch Cooldown)": {
    "en": "Launch Cooldown Settings",
    "ja": "起動待機時間設定 (Launch Cooldown)",
    "zh": "启动冷却间隔设置 (Launch Cooldown)",
    "ko": "실행 쿨다운 설정 (Launch Cooldown)",
    "es": "Ajuste de intervalo de inicio"
  },
  "การปรับใช้ม็อดและโฟลเดอร์ Mod (Mod Deployment)": {
    "en": "Mod Deployment & Folders",
    "ja": "Mod の適用と Mod フォルダ (Mod Deployment)",
    "zh": "Mod 部署与 Mod 文件夹 (Mod Deployment)",
    "ko": "모드 적용 및 모드 폴더 (Mod Deployment)",
    "es": "Despliegue de Mods y Carpetas"
  },
  "การปรับแต่งข้อความและแท็กตัวแปร (Presence Templates)": {
    "en": "Presence Templates & Tags",
    "ja": "Presence テンプレートとタグ (Presence Templates)",
    "zh": "状态模板与变量标签 (Presence Templates)",
    "ko": "프레즌스 템플릿 및 변수 태그 (Presence Templates)",
    "es": "Plantillas y etiquetas de presencia"
  },
  "การลบรอยหยัก (Antialiasing MSAA)": {
    "en": "Antialiasing (MSAA)",
    "ja": "アンチエイリアス (MSAA)",
    "zh": "抗锯齿 (MSAA)",
    "ko": "안티앨리어싱 (MSAA)",
    "es": "Suavizado de bordes (MSAA)"
  },
  "การล็อกรหัสผ่านก่อนเข้าโปรแกรม": {
    "en": "App Password Lock",
    "ja": "アプリ起動時パスワードロック",
    "zh": "程序启动密码锁",
    "ko": "앱 실행 비밀번호 잠금",
    "es": "Bloqueo con contraseña al abrir"
  },
  "การแสดงเวลาที่เล่น (Elapsed Timestamps)": {
    "en": "Elapsed Timestamps Display",
    "ja": "プレイ経過時間の表示 (Elapsed Timestamps)",
    "zh": "游玩时间显示 (Elapsed Timestamps)",
    "ko": "플레이 시간 표시 (Elapsed Timestamps)",
    "es": "Mostrar tiempo transcurrido"
  },
  "การโหลดสคริปต์หน้าถัดไปขัดข้องชั่วคราว": {
    "en": "Next page scripts failed to load temporarily",
    "ja": "次ページのスクリプト読み込みが一時的に失敗しました",
    "zh": "下一页脚本加载暂时失败",
    "ko": "다음 페이지 스크립트를 일시적으로 불러오지 못했습니다",
    "es": "Error temporal al cargar la siguiente página de scripts"
  },
  "กำลังขอ auth ticket": {
    "en": "Requesting auth ticket...",
    "ja": "認証チケットをリクエスト中...",
    "zh": "正在请求认证票据...",
    "ko": "인증 티켓 요청 중...",
    "es": "Solicitando ticket de autenticación..."
  },
  "กำลังขอ auth ticket...": {
    "en": "Requesting auth ticket...",
    "ja": "認証チケットを要求中...",
    "zh": "正在请求认证票据...",
    "ko": "인증 티켓 요청 중...",
    "es": "Solicitando ticket de autenticación..."
  },
  "กำลังค้นหา...": {
    "en": "Searching...",
    "ja": "検索中...",
    "zh": "正在搜索...",
    "ko": "검색 중...",
    "es": "Buscando..."
  },
  "กำลังค้นหาเซิร์ฟเวอร์...": {
    "en": "Searching servers...",
    "ja": "サーバーを検索中...",
    "zh": "正在寻找服务器...",
    "ko": "서버 찾는 중...",
    "es": "Buscando servidores..."
  },
  "กำลังค้นหาและดึงข้อมูลสคริปต์...": {
    "en": "Searching and fetching scripts...",
    "ja": "スクリプトを検索および取得中...",
    "zh": "正在搜索并获取脚本...",
    "ko": "스크립트 검색 및 가져오는 중...",
    "es": "Buscando y obteniendo scripts..."
  },
  "กำลังค้นหาและดึงข้อมูลสคริปต์": {
    "en": "Searching and fetching scripts",
    "ja": "スクリプトを検索および取得中",
    "zh": "正在搜索并获取脚本",
    "ko": "스크립트 검색 및 가져오는 중",
    "es": "Buscando y obteniendo scripts"
  },
  "กำลังค้นหา Discord": {
    "en": "Searching for Discord...",
    "ja": "Discord を検索中...",
    "zh": "正在寻找 Discord...",
    "ko": "Discord 검색 중...",
    "es": "Buscando Discord..."
  },
  "กำลังค้นหา Discord...": {
    "en": "Searching for Discord...",
    "ja": "Discordを検索中...",
    "zh": "正在搜索 Discord...",
    "ko": "Discord 검색 중...",
    "es": "Buscando Discord..."
  },
  "กำลังคำนวณและปรับตำแหน่งตาราง": {
    "en": "Calculating and aligning grid positions...",
    "ja": "グリッド位置を計算・整列中...",
    "zh": "正在计算并对齐网格位置...",
    "ko": "그리드 위치 계산 및 정렬 중...",
    "es": "Calculando y alineando posiciones de cuadrícula..."
  },
  "กำลังคำนวณและปรับตำแหน่งตาราง...": {
    "en": "Calculating and adjusting grid layout...",
    "ja": "グリッド配置を計算して調整中...",
    "zh": "正在计算并调整网格布局...",
    "ko": "그리드 레이아웃 계산 및 조정 중...",
    "es": "Calculando y ajustando cuadrícula..."
  },
  "กำลังเชื่อมต่อ...": {
    "en": "Connecting...",
    "ja": "接続中...",
    "zh": "正在连接...",
    "ko": "연결 중...",
    "es": "Conectando..."
  },
  "กำลังเชื่อมต่อ": {
    "en": "Connecting",
    "ja": "接続中",
    "zh": "正在连接",
    "ko": "연결 중",
    "es": "Conectando"
  },
  "กำลังเชื่อมต่อดาวน์โหลด": {
    "en": "Connecting to download...",
    "ja": "ダウンロードに接続中...",
    "zh": "正在连接下载...",
    "ko": "다운로드 연결 중...",
    "es": "Conectando a la descarga..."
  },
  "กำลังเชื่อมต่อดาวน์โหลด...": {
    "en": "Connecting download...",
    "ja": "ダウンロードに接続中...",
    "zh": "正在连接下载...",
    "ko": "다운로드 연결 중...",
    "es": "Conectando descarga..."
  },
  "กำลังดาวน์โหลดและติดตั้ง Roblox": {
    "en": "Downloading and installing Roblox...",
    "ja": "Roblox をダウンロード・インストール中...",
    "zh": "正在下载并安装 Roblox...",
    "ko": "Roblox 다운로드 및 설치 중...",
    "es": "Descargando e instalando Roblox..."
  },
  "กำลังดาวน์โหลดเวอร์ชัน": {
    "en": "Downloading version...",
    "ja": "バージョンをダウンロード中...",
    "zh": "正在下载版本...",
    "ko": "버전 다운로드 중...",
    "es": "Descargando versión..."
  },
  "กำลังดาวน์โหลดเวอร์ชัน {0} จาก Roblox CDN...": {
    "en": "Downloading version {0} from Roblox CDN...",
    "ja": "Roblox CDNからバージョン {0} をダウンロード中...",
    "zh": "正在从 Roblox CDN 下载版本 {0}...",
    "ko": "Roblox CDN에서 버전 {0} 다운로드 중...",
    "es": "Descargando versión {0} de Roblox CDN..."
  },
  "กำลังดาวน์โหลด Roblox": {
    "en": "Downloading Roblox...",
    "ja": "Roblox をダウンロード中...",
    "zh": "正在下载 Roblox...",
    "ko": "Roblox 다운로드 중...",
    "es": "Descargando Roblox..."
  },
  "กำลังดึงโค้ด": {
    "en": "Fetching code",
    "ja": "コードを取得中",
    "zh": "正在获取代码",
    "ko": "코드 가져오는 중",
    "es": "Obteniendo código"
  },
  "กำลังดึงโค้ด...": {
    "en": "Fetching code...",
    "ja": "コードを取得中...",
    "zh": "正在获取代码...",
    "ko": "코드 가져오는 중...",
    "es": "Obteniendo código..."
  },
  "กำลังดึงหน้าต่าง Roblox ทั้งหมดกลับเข้าพิกัด Grid": {
    "en": "Snapping all Roblox windows back to Grid coordinates...",
    "ja": "すべての Roblox ウィンドウをグリッド位置に整列中...",
    "zh": "正在将所有 Roblox 窗口吸附回网格坐标...",
    "ko": "모든 Roblox 창을 그리드 좌표로 정렬 중...",
    "es": "Alineando todas las ventanas de Roblox a la cuadrícula..."
  },
  "กำลังดึงหน้าต่าง Roblox ทั้งหมดกลับเข้าพิกัด Grid...": {
    "en": "Snapping all Roblox windows back into Grid coordinates...",
    "ja": "すべてのRobloxウィンドウをグリッド座標に戻しています...",
    "zh": "正在将所有 Roblox 窗口吸附回网格坐标...",
    "ko": "모든 Roblox 창을 그리드 좌표로 재정렬 중...",
    "es": "Reajustando todas las ventanas de Roblox a la cuadrícula..."
  },
  "กำลังตรวจจับตำแหน่งหน้าต่าง": {
    "en": "Detecting window positions...",
    "ja": "ウィンドウ位置を検出中...",
    "zh": "正在检测窗口位置...",
    "ko": "창 위치 감지 중...",
    "es": "Detectando posiciones de ventanas..."
  },
  "กำลังตรวจจับตำแหน่งหน้าต่าง...": {
    "en": "Detecting window positions...",
    "ja": "ウィンドウ位置を検出中...",
    "zh": "正在检测窗口位置...",
    "ko": "창 위치 감지 중...",
    "es": "Detectando posiciones de ventanas..."
  },
  "กำลังตรวจเช็ก...": {
    "en": "Checking...",
    "ja": "確認中...",
    "zh": "正在检查...",
    "ko": "확인 중...",
    "es": "Comprobando..."
  },
  "กำลังตรวจเช็ก": {
    "en": "Checking",
    "ja": "確認中",
    "zh": "正在检查",
    "ko": "확인 중",
    "es": "Comprobando"
  },
  "กำลังตรวจเช็ค...": {
    "en": "Checking...",
    "ja": "確認中...",
    "zh": "正在检查...",
    "ko": "확인 중...",
    "es": "Comprobando..."
  },
  "กำลังตรวจเช็ค": {
    "en": "Checking",
    "ja": "確認中",
    "zh": "正在检查",
    "ko": "확인 중",
    "es": "Comprobando"
  },
  "กำลังตรวจสอบ...": {
    "en": "Verifying...",
    "ja": "確認中...",
    "zh": "正在验证...",
    "ko": "확인 중...",
    "es": "Verificando..."
  },
  "กำลังตรวจสอบ": {
    "en": "Verifying",
    "ja": "検証中",
    "zh": "正在验证",
    "ko": "확인 중",
    "es": "Verificando"
  },
  "กำลังตรวจสอบและเพิ่มบัญชี": {
    "en": "Verifying and adding account...",
    "ja": "アカウントを確認・追加中...",
    "zh": "正在验证并添加账户...",
    "ko": "계정 확인 및 추가 중...",
    "es": "Verificando y añadiendo cuenta..."
  },
  "กำลังตรวจสอบและเพิ่มบัญชี {0}/{1}...": {
    "en": "Verifying and adding account {0}/{1}...",
    "ja": "アカウントを確認・追加中 {0}/{1}...",
    "zh": "正在验证并添加账户 {0}/{1}...",
    "ko": "계정 확인 및 추가 중 {0}/{1}...",
    "es": "Verificando y añadiendo cuenta {0}/{1}..."
  },
  "กำลังติดตั้ง Mods ไปยังตัวเกม": {
    "en": "Installing Mods to game client...",
    "ja": "ゲームクライアントに Mod をインストール中...",
    "zh": "正在向游戏客户端安装 Mod...",
    "ko": "게임 클라이언트에 모드 설치 중...",
    "es": "Instalando Mods en el cliente del juego..."
  },
  "กำลังติดตั้ง Mods ไปยังตัวเกม...": {
    "en": "Installing mods to game...",
    "ja": "ゲームにModをインストール中...",
    "zh": "正在将 Mod 安装到游戏中...",
    "ko": "게임에 모드 설치 중...",
    "es": "Instalando mods en el juego..."
  },
  "กำลังทดสอบส่ง Presence ไปยัง Discord": {
    "en": "Testing presence broadcast to Discord...",
    "ja": "Discord へのステータス送信をテスト中...",
    "zh": "正在测试向 Discord 发送状态...",
    "ko": "Discord로 상태 전송 테스트 중...",
    "es": "Probando presencia en Discord..."
  },
  "กำลังทดสอบส่ง Presence ไปยัง Discord...": {
    "en": "Testing Discord Rich Presence...",
    "ja": "Discord Rich Presenceのテスト送信中...",
    "zh": "正在向 Discord 发送 Presence 测试...",
    "ko": "Discord Rich Presence 테스트 전송 중...",
    "es": "Probando Discord Rich Presence..."
  },
  "กำลังทยอยเปิดเกมแบบกลุ่ม": {
    "en": "Batch launching games...",
    "ja": "グループ起動中...",
    "zh": "正在批量启动游戏...",
    "ko": "그룹 실행 순차 진행 중...",
    "es": "Iniciando lote de juegos..."
  },
  "กำลังทยอยเปิดเกมแบบกลุ่ม...": {
    "en": "Staggering package game launch...",
    "ja": "グループゲームを順次起動中...",
    "zh": "正在按组依次启动游戏...",
    "ko": "그룹 게임을 순차적으로 실행 중...",
    "es": "Iniciando juego en grupo escalonado..."
  },
  "กำลังปิดอินสแตนซ์ Roblox ของ": {
    "en": "Closing Roblox instance for",
    "ja": "次のRobloxインスタンスを終了中:",
    "zh": "正在关闭以下账户的 Roblox 实例:",
    "ko": "다음 계정의 Roblox 인스턴스 종료 중:",
    "es": "Cerrando instancia de Roblox para"
  },
  "กำลังปิดอินสแตนซ์ Roblox ของ {0}...": {
    "en": "Closing Roblox instance for {0}...",
    "ja": "{0} のRobloxインスタンスを終了中...",
    "zh": "正在关闭 {0} 的 Roblox 实例...",
    "ko": "{0}의 Roblox 인스턴스 종료 중...",
    "es": "Cerrando instancia de Roblox de {0}..."
  },
  "กำลังเปิด...": {
    "en": "Launching...",
    "ja": "起動中...",
    "zh": "正在启动...",
    "ko": "실행 중...",
    "es": "Iniciando..."
  },
  "กำลังเปิดเกม": {
    "en": "Launching game...",
    "ja": "ゲームを起動中...",
    "zh": "正在启动游戏...",
    "ko": "게임 실행 중...",
    "es": "Iniciando juego..."
  },
  "กำลังเปิดเกม...": {
    "en": "Launching game...",
    "ja": "ゲームを起動中...",
    "zh": "正在启动游戏...",
    "ko": "게임 실행 중...",
    "es": "Iniciando juego..."
  },
  "กำลังเปิดใหม่": {
    "en": "Relaunching",
    "ja": "再起動中",
    "zh": "正在重新启动",
    "ko": "다시 실행 중",
    "es": "Reiniciando"
  },
  "กำลังเปิดใหม่...": {
    "en": "Restarting...",
    "ja": "再起動中...",
    "zh": "正在重新启动...",
    "ko": "다시 시작 중...",
    "es": "Reiniciando..."
  },
  "กำลังเปิด Roblox สำหรับ": {
    "en": "Launching Roblox for",
    "ja": "Roblox を起動中:",
    "zh": "正在启动 Roblox:",
    "ko": "Roblox 실행 중:",
    "es": "Iniciando Roblox para"
  },
  "กำลังเปิด Roblox สำหรับ {0}...": {
    "en": "Launching Roblox for {0}...",
    "ja": "{0} のRobloxを起動中...",
    "zh": "正在为 {0} 启动 Roblox...",
    "ko": "{0}의 Roblox 실행 중...",
    "es": "Iniciando Roblox para {0}..."
  },
  "กำลังเปิด Roblox สำหรับ {0} (กลุ่ม)...": {
    "en": "Launching Roblox for {0} (Package)...",
    "ja": "{0} のRobloxを起動中 (パッケージ)...",
    "zh": "正在为 {0} 启动 Roblox (群组)...",
    "ko": "{0}의 Roblox 실행 중 (그룹)...",
    "es": "Iniciando Roblox para {0} (Grupo)..."
  },
  "กำลังเปิด Roblox สำหรับ {0} เข้าแมพ {1}...": {
    "en": "Launching Roblox for {0} into map {1}...",
    "ja": "{0} をマップ {1} に起動中...",
    "zh": "正在为 {0} 启动 Roblox 进入地图 {1}...",
    "ko": "{0}의 Roblox를 맵 {1}으로 실행 중...",
    "es": "Iniciando Roblox para {0} en el mapa {1}..."
  },
  "กำลังรอเชื่อมต่อ Discord": {
    "en": "Waiting for Discord connection...",
    "ja": "Discord の接続を待機中...",
    "zh": "正在等待 Discord 连接...",
    "ko": "Discord 연결 대기 중...",
    "es": "Esperando conexión con Discord..."
  },
  "กำลังรอเชื่อมต่อ Discord...": {
    "en": "Waiting for Discord connection...",
    "ja": "Discordの接続を待機中...",
    "zh": "正在等待连接 Discord...",
    "ko": "Discord 연결 대기 중...",
    "es": "Esperando conexión con Discord..."
  },
  "กำลังรัน": {
    "en": "Running",
    "ja": "起動中",
    "zh": "正在运行",
    "ko": "실행 중",
    "es": "En ejecución"
  },
  "กำลังรัน...": {
    "en": "Running...",
    "ja": "実行中...",
    "zh": "正在运行...",
    "ko": "실행 중...",
    "es": "En ejecución..."
  },
  "กำลังรันตัวติดตั้ง RobloxPlayerLauncher.exe": {
    "en": "Running installer RobloxPlayerLauncher.exe...",
    "ja": "インストーラー RobloxPlayerLauncher.exe を実行中...",
    "zh": "正在运行安装程序 RobloxPlayerLauncher.exe...",
    "ko": "설치 프로그램 RobloxPlayerLauncher.exe 실행 중...",
    "es": "Ejecutando instalador RobloxPlayerLauncher.exe..."
  },
  "กำลังรันตัวติดตั้ง RobloxPlayerLauncher.exe...": {
    "en": "Running RobloxPlayerLauncher.exe installer...",
    "ja": "RobloxPlayerLauncher.exe インストーラーを実行中...",
    "zh": "正在运行 RobloxPlayerLauncher.exe 安装程序...",
    "ko": "RobloxPlayerLauncher.exe 설치 프로그램을 실행 중...",
    "es": "Ejecutando instalador RobloxPlayerLauncher.exe..."
  },
  "กำลังเล่นมากสุด": {
    "en": "Most Playing",
    "ja": "最多プレイヤー数",
    "zh": "玩家最多",
    "ko": "최다 플레이어",
    "es": "Más jugadores"
  },
  "กำลังเล่นอยู่": {
    "en": "Playing Now",
    "ja": "プレイ中",
    "zh": "正在游玩",
    "ko": "현재 플레이 중",
    "es": "Jugando ahora"
  },
  "กำลังส่งข้อความทดสอบ Webhook": {
    "en": "Sending Webhook test message...",
    "ja": "Webhook テストメッセージを送信中...",
    "zh": "正在发送 Webhook 测试消息...",
    "ko": "Webhook 테스트 메시지 전송 중...",
    "es": "Enviando mensaje de prueba de Webhook..."
  },
  "กำลังส่งข้อความทดสอบ Webhook...": {
    "en": "Sending test message to Webhook...",
    "ja": "Webhookにテストメッセージを送信中...",
    "zh": "正在向 Webhook 发送测试消息...",
    "ko": "Webhook으로 테스트 메시지 전송 중...",
    "es": "Enviando mensaje de prueba al Webhook..."
  },
  "กำลังโหลด…": {
    "en": "Loading…",
    "ja": "読み込み中…",
    "zh": "正在加载…",
    "ko": "불러오는 중…",
    "es": "Cargando…"
  },
  "กำลังโหลด...": {
    "en": "Loading...",
    "ja": "読み込み中...",
    "zh": "正在加载...",
    "ko": "불러오는 중...",
    "es": "Cargando..."
  },
  "กำลังโหลด": {
    "en": "Loading",
    "ja": "読み込み中",
    "zh": "正在加载",
    "ko": "불러오는 중",
    "es": "Cargando"
  },
  "กำลังโหลดเกม…": {
    "en": "Loading game…",
    "ja": "ゲーム読み込み中…",
    "zh": "正在加载游戏…",
    "ko": "게임 로딩 중…",
    "es": "Cargando juego…"
  },
  "กำลังโหลดเกม": {
    "en": "Loading game",
    "ja": "ゲーム読み込み中",
    "zh": "正在加载游戏",
    "ko": "게임 로딩 중",
    "es": "Cargando juego"
  },
  "กำลังโหลดชาร์ตเกม...": {
    "en": "Loading charts...",
    "ja": "チャートを読み込み中...",
    "zh": "正在加载图表...",
    "ko": "차트를 불러오는 중...",
    "es": "Cargando gráficos..."
  },
  "กำลังโหลดแมพเพิ่มเติม...": {
    "en": "Loading more maps...",
    "ja": "さらにマップを読み込み中...",
    "zh": "正在加载更多地图...",
    "ko": "추가 맵 로딩 중...",
    "es": "Cargando más mapas..."
  },
  "กำลังโหลดแมพเพิ่มเติม": {
    "en": "Loading more maps",
    "ja": "さらにマップを読み込み中",
    "zh": "正在加载更多地图",
    "ko": "추가 맵 로딩 중",
    "es": "Cargando más mapas"
  },
  "กำลังโหลดรูปภาพ...": {
    "en": "Loading image...",
    "ja": "画像を読み込み中...",
    "zh": "正在加载图像...",
    "ko": "이미지 로딩 중...",
    "es": "Cargando imagen..."
  },
  "กำลังโหลดสคริปต์หน้าถัดไป...": {
    "en": "Loading next page scripts...",
    "ja": "次ページのスクリプトを読み込み中...",
    "zh": "正在加载下一页脚本...",
    "ko": "다음 페이지 스크립트 불러오는 중...",
    "es": "Cargando scripts de la siguiente página..."
  },
  "กำลังโหลดสคริปต์หน้าถัดไป": {
    "en": "Loading next page scripts",
    "ja": "次ページのスクリプトを読み込み中",
    "zh": "正在加载下一页脚本",
    "ko": "다음 페이지 스크립트 불러오는 중",
    "es": "Cargando scripts de la siguiente página"
  },
  "กำลังโหลดหน้าเข้าสู่ระบบ Roblox...": {
    "en": "Loading Roblox login page...",
    "ja": "Roblox ログイン画面を読み込み中...",
    "zh": "正在加载 Roblox 登录页面...",
    "ko": "Roblox 로그인 페이지 로딩 중...",
    "es": "Cargando página de inicio de sesión de Roblox..."
  },
  "กำลังโหลดหน้าเข้าสู่ระบบ Roblox": {
    "en": "Loading Roblox login page",
    "ja": "Roblox ログイン画面を読み込み中",
    "zh": "正在加载 Roblox 登录页面",
    "ko": "Roblox 로그인 페이지 로딩 중",
    "es": "Cargando página de inicio de sesión de Roblox"
  },
  "กำลังโหลดหน้าหลัก Roblox...": {
    "en": "Loading Roblox home page...",
    "ja": "Roblox ホームを読み込み中...",
    "zh": "正在加载 Roblox 主页...",
    "ko": "Roblox 홈 불러오는 중...",
    "es": "Cargando página principal de Roblox..."
  },
  "กำลังโหลดหน้าหลัก Roblox": {
    "en": "Loading Roblox home page",
    "ja": "Roblox ホームを読み込み中",
    "zh": "正在加载 Roblox 主页",
    "ko": "Roblox 홈 불러오는 중",
    "es": "Cargando página principal de Roblox"
  },
  "กำหนดปลายทาง URL สถิติเป็น 0.0.0.0 เพื่อตัดการส่งข้อมูล": {
    "en": "Set telemetry URL to 0.0.0.0 to prevent sending data",
    "ja": "テレメトリ URL を 0.0.0.0 に設定してデータ送信を遮断",
    "zh": "将遥测 URL 指向 0.0.0.0 以切断数据发送",
    "ko": "통계 수집 URL을 0.0.0.0으로 지정하여 데이터 전송 차단",
    "es": "Fijar URL de telemetría en 0.0.0.0 para cortar el envío de datos"
  },
  "กำหนดพาธเอง (Custom Path)": {
    "en": "Custom Path",
    "ja": "カスタムパス (Custom Path)",
    "zh": "自定义路径 (Custom Path)",
    "ko": "사용자 지정 경로 (Custom Path)",
    "es": "Ruta personalizada"
  },
  "กำหนดเอง": {
    "en": "Custom",
    "ja": "カスタム",
    "zh": "自定义",
    "ko": "사용자 지정",
    "es": "Personalizado"
  },
  "กำหนดเอง ({0} FPS)": {
    "en": "Custom ({0} FPS)",
    "ja": "カスタム ({0} FPS)",
    "zh": "自定义 ({0} FPS)",
    "ko": "사용자 지정 ({0} FPS)",
    "es": "Personalizado ({0} FPS)"
  },
  "กำหนดเอง... (Custom)": {
    "en": "Custom... (Custom)",
    "ja": "カスタム... (Custom)",
    "zh": "自定义... (Custom)",
    "ko": "사용자 지정... (Custom)",
    "es": "Personalizado... (Custom)"
  },
  "กำหนดเอง (Custom)": {
    "en": "Custom (Custom)",
    "ja": "カスタム (Custom)",
    "zh": "自定义 (Custom)",
    "ko": "사용자 지정 (Custom)",
    "es": "Personalizado (Custom)"
  },
  "กุหลาบ": {
    "en": "Rose",
    "ja": "ローズ",
    "zh": "玫瑰粉",
    "ko": "로즈핑크",
    "es": "Rosa"
  },
  "เกม": {
    "en": "Game",
    "ja": "ゲーム",
    "zh": "游戏",
    "ko": "게임",
    "es": "Juego"
  },
  "เกิดข้อผิดพลาด": {
    "en": "An error occurred",
    "ja": "エラーが発生しました",
    "zh": "发生错误",
    "ko": "오류가 발생했습니다",
    "es": "Ocurrió un error"
  },
  "เกิดข้อผิดพลาด:": {
    "en": "Error occurred:",
    "ja": "エラーが発生しました:",
    "zh": "发生错误:",
    "ko": "오류 발생:",
    "es": "Ocurrió un error:"
  },
  "เกิดข้อผิดพลาดในการดาวน์โหลด": {
    "en": "Download error occurred",
    "ja": "ダウンロード中にエラーが発生しました",
    "zh": "下载过程中发生错误",
    "ko": "다운로드 중 오류가 발생했습니다",
    "es": "Ocurrió un error durante la descarga"
  },
  "เกิดข้อผิดพลาดในการดาวน์โหลดเวอร์ชัน Roblox": {
    "en": "Error downloading Roblox version",
    "ja": "Roblox バージョンのダウンロード中にエラーが発生しました",
    "zh": "下载 Roblox 版本时出错",
    "ko": "Roblox 버전 다운로드 중 오류 발생",
    "es": "Error al descargar versión de Roblox"
  },
  "เกิดข้อผิดพลาดในการดึงข้อมูล": {
    "en": "Error retrieving data",
    "ja": "データの取得中にエラーが発生しました",
    "zh": "获取数据时发生错误",
    "ko": "데이터를 가져오는 중 오류가 발생했습니다",
    "es": "Error al obtener datos"
  },
  "เกิดข้อผิดพลาดในการทดสอบ": {
    "en": "Test failed with error",
    "ja": "テスト中にエラーが発生しました",
    "zh": "测试过程中发生错误",
    "ko": "테스트 중 오류가 발생했습니다",
    "es": "Ocurrió un error en la prueba"
  },
  "เกิดข้อผิดพลาดในการทดสอบ:": {
    "en": "Error during test:",
    "ja": "テスト中にエラーが発生:",
    "zh": "测试时发生错误:",
    "ko": "테스트 중 오류 발생:",
    "es": "Error durante la prueba:"
  },
  "เกิดข้อผิดพลาดในการยกเลิกรหัสผ่าน": {
    "en": "Error occurred while resetting password",
    "ja": "パスワードのリセット中にエラーが発生しました",
    "zh": "取消密码时发生错误",
    "ko": "비밀번호 재설정 중 오류가 발생했습니다",
    "es": "Ocurrió un error al restablecer la contraseña"
  },
  "เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง": {
    "en": "An error occurred. Please try again.",
    "ja": "エラーが発生しました。再試行してください。",
    "zh": "发生错误。请重试。",
    "ko": "오류가 발생했습니다. 다시 시도하세요.",
    "es": "Ocurrió un error. Por favor reintente."
  },
  "เกี่ยวกับ": {
    "en": "About",
    "ja": "情報",
    "zh": "关于",
    "ko": "정보",
    "es": "Acerca de"
  },
  "แก้ไข": {
    "en": "Edit",
    "ja": "編集",
    "zh": "编辑",
    "ko": "편집",
    "es": "Editar"
  },
  "แก้ไข -": {
    "en": "Edit -",
    "ja": "編集 -",
    "zh": "编辑 -",
    "ko": "편집 -",
    "es": "Editar -"
  },
  "แก้ไขกลุ่ม": {
    "en": "Edit Package",
    "ja": "グループを編集",
    "zh": "编辑群组",
    "ko": "그룹 편집",
    "es": "Editar grupo"
  },
  "แก้ไขบัญชี": {
    "en": "Edit Account",
    "ja": "アカウントを編集",
    "zh": "编辑账户",
    "ko": "계정 편집",
    "es": "Editar cuenta"
  },
  "แก้ไขปัญหากราฟิกเบลอบนจอความละเอียดสูงและหน้าจอ High-DPI": {
    "en": "Fix blurry graphics on High-DPI and high-resolution displays",
    "ja": "高解像度および High-DPI ディスプレイでの描画ボケを解消",
    "zh": "修复高分辨率及 High-DPI 屏幕上的画面模糊问题",
    "ko": "고해상도 및 High-DPI 디스플레이에서의 그래픽 번짐 현상 수정",
    "es": "Corrige gráficos borrosos en pantallas de alta resolución y High-DPI"
  },
  "แก้ไขภาพเบลอบนหน้าจอ High-DPI หรือจอ 2K / 4K": {
    "en": "Fix blur on High-DPI or 2K/4K displays",
    "ja": "High-DPI または 2K/4K 画面でのボケを解消",
    "zh": "修复 High-DPI 或 2K/4K 屏幕上的模糊问题",
    "ko": "High-DPI 또는 2K/4K 화면의 흐림 현상 해결",
    "es": "Corrige la imagen borrosa en pantallas High-DPI o 2K / 4K"
  },
  "แก้ไขรหัส JSON โดยตรง ระบบจะตรวจสอบความถูกต้องอัตโนมัติก่อนบันทึก": {
    "en": "Edit raw JSON directly. Syntax will be validated automatically before saving.",
    "ja": "JSON を直接編集。保存前に構文が自動検証されます。",
    "zh": "直接编辑 JSON 代码。保存前系统将自动检查语法有效性。",
    "ko": "JSON을 직접 편집하세요. 저장하기 전에 문법을 자동으로 검사합니다.",
    "es": "Edita JSON directamente. La sintaxis se validará automáticamente antes de guardar."
  },
  "แก้ไข Raw JSON": {
    "en": "Edit Raw JSON",
    "ja": "Raw JSON を編集",
    "zh": "编辑原始 JSON",
    "ko": "원시 JSON 편집",
    "es": "Editar JSON sin procesar"
  },
  "ขยายหน้าต่าง": {
    "en": "Maximize Window",
    "ja": "ウィンドウを最大化",
    "zh": "最大化窗口",
    "ko": "창 최대화",
    "es": "Maximizar ventana"
  },
  "ข้อความบรรทัดที่ 1 (Details)": {
    "en": "Line 1 (Details)",
    "ja": "1行目 (Details)",
    "zh": "第一行 (Details)",
    "ko": "첫 번째 줄 (Details)",
    "es": "Línea 1 (Detalles)"
  },
  "ข้อความบรรทัดที่ 2 (State)": {
    "en": "Line 2 (State)",
    "ja": "2行目 (State)",
    "zh": "第二行 (State)",
    "ko": "두 번째 줄 (State)",
    "es": "Línea 2 (Estado)"
  },
  "ข้อความปุ่มที่ 1": {
    "en": "Button 1 Text",
    "ja": "ボタン1のテキスト",
    "zh": "按钮 1 文本",
    "ko": "버튼 1 텍스트",
    "es": "Texto del botón 1"
  },
  "ข้อความปุ่มที่ 2": {
    "en": "Button 2 Text",
    "ja": "ボタン2のテキスト",
    "zh": "按钮 2 文本",
    "ko": "버튼 2 텍스트",
    "es": "Texto del botón 2"
  },
  "ข้อความเมื่อชี้รูปภาพเล็ก (Small Image Tooltip)": {
    "en": "Small Image Tooltip",
    "ja": "スモール画像ツールチップ (Small Image Tooltip)",
    "zh": "小图标悬停提示 (Small Image Tooltip)",
    "ko": "작은 이미지 툴팁 (Small Image Tooltip)",
    "es": "Información de imagen pequeña"
  },
  "ข้อความเมื่อชี้รูปภาพใหญ่ (Large Image Tooltip)": {
    "en": "Large Image Tooltip",
    "ja": "ラージ画像ツールチップ (Large Image Tooltip)",
    "zh": "大图标悬停提示 (Large Image Tooltip)",
    "ko": "큰 이미지 툴팁 (Large Image Tooltip)",
    "es": "Información de imagen grande"
  },
  "ของคุณ": {
    "en": "Your",
    "ja": "あなたの",
    "zh": "您的",
    "ko": "사용자의",
    "es": "Tu"
  },
  "ของคุณด้านล่าง (รองรับการใส่พร้อมกันหลายบรรทัด/หลายคุกกี้)": {
    "en": "below (supports pasting multiple lines/cookies simultaneously)",
    "ja": "以下に入力 (複数行・複数クッキーの同時貼り付けに対応)",
    "zh": "于下方 (支持同时粘贴多行/多个 Cookie)",
    "ko": "아래에 입력 (여러 줄/여러 쿠키 동시 입력 지원)",
    "es": "debajo (admite varias líneas/cookies a la vez)"
  },
  "ข้อผิดพลาด (Errors)": {
    "en": "Errors",
    "ja": "エラー (Errors)",
    "zh": "错误 (Errors)",
    "ko": "오류 (Errors)",
    "es": "Errores"
  },
  "ข้อมูลที่กรอกไม่ถูกต้อง กรุณาใส่ Place ID, URL เกม หรือ ลิงก์ private server": {
    "en": "Invalid input. Please enter Place ID, Game URL, or Private Server link",
    "ja": "入力内容が無効です。Place ID、ゲームURL、またはプライベートサーバーリンクを入力してください",
    "zh": "输入数据无效。请输入 Place ID、游戏链接或私人服务器链接",
    "ko": "잘못된 입력입니다. Place ID, 게임 URL 또는 비공개 서버 링크를 입력하세요",
    "es": "Entrada no válida. Introduce Place ID, URL del juego o enlace de servidor privado"
  },
  "ข้อมูลและความเป็นส่วนตัว": {
    "en": "Data & Privacy",
    "ja": "データとプライバシー",
    "zh": "数据与隐私",
    "ko": "데이터 및 개인정보",
    "es": "Datos y privacidad"
  },
  "ข้อมูลวิธีติดตั้งและใช้งานด่วน": {
    "en": "Quick installation and usage guide",
    "ja": "クイックインストールと使用ガイド",
    "zh": "快速安装与使用指南",
    "ko": "빠른 설치 및 사용 가이드",
    "es": "Guía rápida de uso"
  },
  "ขอ auth ticket ไม่สำเร็จ (HTTP)": {
    "en": "Failed to request auth ticket (HTTP)",
    "ja": "認証チケットの要求に失敗しました (HTTP)",
    "zh": "请求认证票据失败 (HTTP)",
    "ko": "인증 티켓 요청 실패 (HTTP)",
    "es": "Error al solicitar auth ticket (HTTP)"
  },
  "ขอ auth ticket ไม่สำเร็จ (HTTP": {
    "en": "Failed to request auth ticket (HTTP",
    "ja": "認証チケットの要求に失敗しました (HTTP",
    "zh": "请求认证票据失败 (HTTP",
    "ko": "인증 티켓 요청 실패 (HTTP",
    "es": "Error al solicitar auth ticket (HTTP"
  },
  "ขอ auth ticket ไม่สำเร็จ (HTTP {0}) กรุณาลองอีกครั้งในสักครู่": {
    "en": "Failed to request auth ticket (HTTP {0}). Please try again shortly.",
    "ja": "認証チケットの要求に失敗しました (HTTP {0})。しばらくしてから再試行してください。",
    "zh": "获取认证票据失败 (HTTP {0})。请稍后重试。",
    "ko": "인증 티켓 요청에 실패했습니다 (HTTP {0}). 잠시 후 다시 시도하세요.",
    "es": "Error al solicitar ticket de autenticación (HTTP {0}). Inténtalo más tarde."
  },
  "ขั้นสูง": {
    "en": "Advanced",
    "ja": "高度な設定",
    "zh": "高级",
    "ko": "고급",
    "es": "Avanzado"
  },
  "เข้าใจแล้ว": {
    "en": "Got it",
    "ja": "了解",
    "zh": "明白了",
    "ko": "확인했습니다",
    "es": "Entendido"
  },
  "เข้าแมพ": {
    "en": "Join Map",
    "ja": "マップに参加",
    "zh": "加入地图",
    "ko": "맵 참가",
    "es": "Unirse al mapa"
  },
  "เข้าแมพโดยระบุ ID": {
    "en": "Join Map by ID",
    "ja": "ID でマップに参加",
    "zh": "按 ID 加入地图",
    "ko": "ID로 맵 참가",
    "es": "Unirse al mapa por ID"
  },
  "เข้าสู่ระบบค้างไว้ไหม": {
    "en": "Remember me?",
    "ja": "ログイン状態を保持する",
    "zh": "记住密码/保持登录?",
    "ko": "로그인 상태 유지?",
    "es": "¿Recordarme?"
  },
  "เข้าสู่ระบบด้วย Roblox": {
    "en": "Log in with Roblox",
    "ja": "Roblox でログイン",
    "zh": "使用 Roblox 登录",
    "ko": "Roblox로 로그인",
    "es": "Iniciar sesión con Roblox"
  },
  "เข้าสู่ระบบเป็น": {
    "en": "Logged in as",
    "ja": "ログイン中:",
    "zh": "登录身份为",
    "ko": "로그인된 계정:",
    "es": "Sesión iniciada como"
  },
  "เขียน/แก้ไข JSON โดยตรง ค่าจะถูกซิงค์กลับไปยังตารางโดยอัตโนมัติ": {
    "en": "Write/edit JSON directly; values sync back to the table automatically",
    "ja": "JSON を直接編集。値はテーブルに自動で反映されます。",
    "zh": "直接编写/编辑 JSON，数值将自动同步回表格。",
    "ko": "JSON을 직접 작성/편집하면 표에 자동으로 동기화됩니다.",
    "es": "Escribe/edita JSON directamente; los valores se sincronizan automáticamente con la tabla"
  },
  "เขียนไฟล์ FastFlags และตรวจเช็คความพร้อมทุกครั้งก่อนเริ่มรัน Roblox": {
    "en": "Writes FastFlags files and verifies readiness before each Roblox launch",
    "ja": "Roblox 起動ごとに FastFlags ファイルを書き込み準備を確認",
    "zh": "每次启动 Roblox 前写入 FastFlags 文件并检查运行环境就绪状态",
    "ko": "Roblox를 시작할 때마다 FastFlags 파일을 작성하고 준비 상태를 확인합니다",
    "es": "Escribe archivos FastFlags y comprueba el estado antes de iniciar Roblox"
  },
  "เขียนลง": {
    "en": "Writes to",
    "ja": "書き込み先:",
    "zh": "写入到",
    "ko": "기록 위치:",
    "es": "Escribe en"
  },
  "เขียนลง GlobalBasicSettings_13.xml - วิธีที่ยังใช้ได้หลัง Roblox จำกัด Fast Flag แล้ว มีผลเมื่อเปิดครั้งถัดไป": {
    "en": "Writes to GlobalBasicSettings_13.xml. Works even after FFlags block. Takes effect next launch.",
    "ja": "GlobalBasicSettings_13.xml に書き込み。FFlagsブロック後も有効。次回起動時に反映。",
    "zh": "写入 GlobalBasicSettings_13.xml。即使 FFlags 受限也依然有效。下次启动时生效。",
    "ko": "GlobalBasicSettings_13.xml에 기록합니다. FFlags 차단 후에도 작동합니다. 다음 실행 시 반영.",
    "es": "Escribe en GlobalBasicSettings_13.xml. Funciona tras bloquear FFlags. Se aplica al reiniciar."
  },
  "คงสถานะอินสแตนซ์เพื่อป้องกันการตัดการเชื่อมต่อหลังจากปล่อยนิ่ง 20 นาที": {
    "en": "Keeps instance active to prevent disconnection after 20 minutes idle",
    "ja": "20分間アイドル時の自動切断を防ぐため接続を維持",
    "zh": "保持实例活跃以防止闲置 20 分钟后掉线",
    "ko": "20분 이상 자리 비움 시 강제 퇴장되지 않도록 인스턴스를 유지합니다",
    "es": "Mantiene la instancia activa para evitar desconexión tras 20 minutos"
  },
  "คงอินสแตนซ์ไว้ไม่ให้ถูกเตะออกตอนปล่อยทิ้งไว้ 20 นาที": {
    "en": "Keep Roblox client active to prevent being kicked after 20 minutes idle.",
    "ja": "20分間放置してもキックされないよう、Robloxクライアントをアクティブに保ちます。",
    "zh": "保持 Roblox 客户端活跃，防止闲置 20 分钟后被踢。",
    "ko": "20분 이상 자리 비움 시 강제 퇴장되지 않도록 Roblox 클라이언트를 활성화 상태로 유지합니다.",
    "es": "Mantener Roblox activo para evitar que te expulsen tras 20 minutos inactivo."
  },
  "คง mutex ของ singleton ไว้เพื่อให้ไคลเอนต์หลายตัวรันพร้อมกันได้": {
    "en": "Holds the singleton mutex to let multiple clients run concurrently",
    "ja": "ミューテックスを保持し、複数クライアントの同時起動を可能にします",
    "zh": "解除单实例锁互斥体以允许同时运行多个客户端",
    "ko": "싱글톤 뮤텍스를 유지하여 여러 클라이언트가 동시에 실행되도록 합니다",
    "es": "Mantiene el mutex del singleton para permitir abrir varios clientes"
  },
  "ค้นหา": {
    "en": "Search",
    "ja": "検索",
    "zh": "搜索",
    "ko": "검색",
    "es": "Buscar"
  },
  "ค้นหาการตั้งค่า FastFlags หรือคีย์เวิร์ด...": {
    "en": "Search FastFlags settings or keywords...",
    "ja": "FastFlags 設定またはキーワードを検索...",
    "zh": "搜索 FastFlags 设置或关键词...",
    "ko": "FastFlags 설정 또는 키워드 검색...",
    "es": "Buscar ajustes de FastFlags o palabras clave..."
  },
  "ค้นหาการตั้งค่า FastFlags หรือคีย์เวิร์ด": {
    "en": "Search FastFlags settings or keywords",
    "ja": "FastFlags 設定またはキーワードを検索",
    "zh": "搜索 FastFlags 设置或关键词",
    "ko": "FastFlags 설정 또는 키워드 검색",
    "es": "Buscar ajustes de FastFlags o palabras clave"
  },
  "ค้นหาเกม…": {
    "en": "Search games…",
    "ja": "ゲームを検索…",
    "zh": "搜索游戏…",
    "ko": "게임 검색…",
    "es": "Buscar juegos…"
  },
  "ค้นหาเกม": {
    "en": "Search Games",
    "ja": "ゲームを検索",
    "zh": "搜索游戏",
    "ko": "게임 검색",
    "es": "Buscar juegos"
  },
  "ค้นหาชื่อ Flag หรือค่า...": {
    "en": "Search Flag name or value...",
    "ja": "Flag 名または値を検索...",
    "zh": "搜索 Flag 名称或数值...",
    "ko": "Flag 이름 또는 값 검색...",
    "es": "Buscar nombre de Flag o valor..."
  },
  "ค้นหาชื่อ Flag หรือค่า": {
    "en": "Search Flag name or value",
    "ja": "Flag 名または値を検索",
    "zh": "搜索 Flag 名称或数值",
    "ko": "Flag 이름 또는 값 검색",
    "es": "Buscar nombre de Flag o valor"
  },
  "ค้นหาในบันทึก…": {
    "en": "Search in logs…",
    "ja": "ログ内を検索…",
    "zh": "在日志中搜索…",
    "ko": "로그에서 검색…",
    "es": "Buscar en registros…"
  },
  "ค้นหาในบันทึก": {
    "en": "Search in Logs",
    "ja": "ログ内を検索",
    "zh": "在日志中搜索",
    "ko": "로그에서 검색",
    "es": "Buscar en registros"
  },
  "ค้นหาในโปรไฟล์...": {
    "en": "Search in profile...",
    "ja": "プロファイル内を検索...",
    "zh": "在配置文件中搜索...",
    "ko": "프로필에서 검색...",
    "es": "Buscar en el perfil..."
  },
  "ค้นหาในโปรไฟล์": {
    "en": "Search in Profile",
    "ja": "プロファイル内を検索",
    "zh": "在配置文件中搜索",
    "ko": "프로필에서 검색",
    "es": "Buscar en el perfil"
  },
  "ค้นหาบัญชี...": {
    "en": "Search accounts...",
    "ja": "アカウントを検索...",
    "zh": "搜索账户...",
    "ko": "계정 검색...",
    "es": "Buscar cuentas..."
  },
  "ค้นหาแมพ": {
    "en": "Search Maps",
    "ja": "マップ検索",
    "zh": "搜索地图",
    "ko": "맵 검색",
    "es": "Buscar mapas"
  },
  "ค้นหาและเข้าเล่นเกมบน Roblox": {
    "en": "Search and play games on Roblox",
    "ja": "Robloxのゲームを検索してプレイ",
    "zh": "在 Roblox 上搜索并玩游戏",
    "ko": "Roblox에서 게임 검색 및 플레이",
    "es": "Buscar y jugar games en Roblox"
  },
  "ค้นหาและคัดลอกสคริปต์แบบเรียลไทม์": {
    "en": "Search and copy scripts in real-time",
    "ja": "リアルタイムでスクリプトを検索してコピー",
    "zh": "实时搜索并复制脚本",
    "ko": "실시간으로 스크립트 검색 및 복사",
    "es": "Busca y copia scripts en tiempo real"
  },
  "ค้นหาสคริปต์ (เช่น Blox Fruits, Admin)...": {
    "en": "Search scripts (e.g. Blox Fruits, Admin)...",
    "ja": "スクリプトを検索 (例: Blox Fruits, Admin)...",
    "zh": "搜索脚本 (如 Blox Fruits, Admin)...",
    "ko": "스크립트 검색 (예: Blox Fruits, Admin)...",
    "es": "Buscar scripts (ej. Blox Fruits, Admin)..."
  },
  "ค้นหาสคริปต์ (เช่น Blox Fruits, Admin)": {
    "en": "Search scripts (e.g. Blox Fruits, Admin)",
    "ja": "スクリプトを検索 (例: Blox Fruits, Admin)",
    "zh": "搜索脚本 (如 Blox Fruits, Admin)",
    "ko": "스크립트 검색 (예: Blox Fruits, Admin)",
    "es": "Buscar scripts (ej. Blox Fruits, Admin)"
  },
  "คลังสคริปต์ (ScriptBlox)": {
    "en": "Script Hub (ScriptBlox)",
    "ja": "スクリプトハブ (ScriptBlox)",
    "zh": "脚本中心 (ScriptBlox)",
    "ko": "스크립트 허브 (ScriptBlox)",
    "es": "Centro de Scripts (ScriptBlox)"
  },
  "คลัง FastFlags ยอดนิยม (Preset Library)": {
    "en": "Preset Library (Popular FastFlags)",
    "ja": "プリセットライブラリ (人気の FastFlags)",
    "zh": "预设库 (热门 FastFlags)",
    "ko": "프리셋 라이브러리 (인기 FastFlags)",
    "es": "Biblioteca de Ajustes Predefinidos (FastFlags populares)"
  },
  "คลัง Flags ยอดนิยม": {
    "en": "Popular Flags Library",
    "ja": "人気 Flags ライブラリ",
    "zh": "热门 Flags 库",
    "ko": "인기 Flags 라이브러리",
    "es": "Biblioteca de Flags populares"
  },
  "คลิกปุ่ม \"เพิ่ม\" เพื่อใส่ FastFlag ยอดนิยมที่ผ่านการทดสอบแล้วลงใน ClientAppSettings ของคุณทันที": {
    "en": "Click \"Add\" to apply tested popular FastFlags directly into your ClientAppSettings",
    "ja": "「追加」をクリックして、テスト済みの人気 FastFlag を ClientAppSettings に即座に適用",
    "zh": "点击“添加”按钮，立即将经过测试的热门 FastFlag 应用到您的 ClientAppSettings",
    "ko": "\"추가\" 버튼을 클릭하여 검증된 인기 FastFlag를 ClientAppSettings에 즉시 적용하세요",
    "es": "Haz clic en \"Añadir\" para aplicar FastFlags probados en tu ClientAppSettings"
  },
  "คลิกเพิ่มบัญชีในแถบด้านข้าง เข้าสู่ระบบผ่านเบราว์เซอร์หรือวางคุกกี้": {
    "en": "Click Add Account in sidebar. Log in via browser or paste cookie.",
    "ja": "サイドバーの「アカウント追加」をクリック。ブラウザログインまたはCookie貼り付け。",
    "zh": "点击侧边栏的“添加账户”。通过浏览器登录或粘贴 Cookie。",
    "ko": "사이드바에서 계정 추가를 클릭하세요. 브라우저로 로그인하거나 쿠키를 붙여넣으세요.",
    "es": "Haz clic en Añadir cuenta en la barra lateral. Inicia sesión con el navegador o pega la cookie."
  },
  "คลิก \"เพิ่มบัญชี\" เพื่อเข้าสู่ระบบ Roblox": {
    "en": "Click \"Add Account\" to log in to Roblox",
    "ja": "「アカウント追加」をクリックして Roblox にログイン",
    "zh": "点击“添加账户”登录 Roblox",
    "ko": "\"계정 추가\"를 클릭하여 Roblox에 로그인하세요",
    "es": "Haz clic en \"Añadir cuenta\" para iniciar sesión en Roblox"
  },
  "คลิกเพื่อแทรกแท็ก:": {
    "en": "Click to insert tag:",
    "ja": "クリックしてタグを挿入:",
    "zh": "点击插入标签:",
    "ko": "클릭하여 태그 삽입:",
    "es": "Clic para insertar etiqueta:"
  },
  "คลิกเพื่อแทรกแท็ก": {
    "en": "Click to insert tag",
    "ja": "クリックしてタグを挿入",
    "zh": "点击插入标签",
    "ko": "클릭하여 태그 삽입",
    "es": "Clic para insertar etiqueta"
  },
  "คลิกเริ่มบนการ์ดใดก็ได้ ตั้งรหัสเกมหรือลิงก์เซิร์ฟเวอร์ส่วนตัวผ่านปุ่มแก้ไขเพื่อเปิดเข้าเกมโดยตรง": {
    "en": "Click Launch on any card. Set Game ID or Private Server link via Edit button to join directly.",
    "ja": "カードの「開始」をクリック。編集ボタンから Place ID やプライベートサーバーリンクを設定して直接参加。",
    "zh": "点击卡片上的启动。可通过编辑按钮设置游戏 ID 或私人服务器链接以直接加入游戏。",
    "ko": "카드의 시작을 클릭하세요. 편집 버튼을 통해 게임 ID 또는 비공개 서버 링크를 설정하여 바로 접속할 수 있습니다.",
    "es": "Haz clic en Iniciar. Configura Place ID o enlace de servidor privado con Editar para entrar directo."
  },
  "คลิกลากกล่องหน้าต่างเพื่อย้าย หรือลากมุมขวาล่างเพื่อย่อขยายขนาดได้ทันที": {
    "en": "Drag window box to reposition, or drag bottom-right corner to resize",
    "ja": "ウィンドウをドラッグして移動、右下をドラッグして即座にリサイズ",
    "zh": "拖拽窗口框进行移动，或拖动右下角调整大小",
    "ko": "창 상자를 드래그하여 이동하거나 우측 하단을 드래그하여 크기를 조절하세요",
    "es": "Arrastra la ventana para moverla o la esquina inferior derecha para redimensionar"
  },
  "ความปลอดภัยและป้องกัน Crash Dumps": {
    "en": "Security & Crash Dump Prevention",
    "ja": "セキュリティとクラッシュダンプ防止",
    "zh": "安全性与崩溃转储阻止",
    "ko": "보안 및 크래시 덤프 방지",
    "es": "Seguridad y prevención de volcados de memoria"
  },
  "ความเป็นส่วนตัวและขั้นสูง (Privacy & Advanced)": {
    "en": "Privacy & Advanced",
    "ja": "プライバシーと高度な設定 (Privacy & Advanced)",
    "zh": "隐私与高级设置 (Privacy & Advanced)",
    "ko": "개인정보 및 고급 설정 (Privacy & Advanced)",
    "es": "Privacidad y avanzado"
  },
  "ความเป็นส่วนตัวและความปลอดภัย (Privacy & Security)": {
    "en": "Privacy & Security",
    "ja": "プライバシーとセキュリティ (Privacy & Security)",
    "zh": "隐私与安全 (Privacy & Security)",
    "ko": "개인정보 및 보안 (Privacy & Security)",
    "es": "Privacidad y seguridad"
  },
  "ความโปร่งใสอัตโนมัติ (Auto Window Opacity)": {
    "en": "Auto Window Opacity",
    "ja": "ウィンドウ透明度の自動調整 (Auto Window Opacity)",
    "zh": "自动窗口透明度 (Auto Window Opacity)",
    "ko": "자동 창 투명도 (Auto Window Opacity)",
    "es": "Opacidad automática de ventana"
  },
  "คะแนนสูงสุด": {
    "en": "Top Rated",
    "ja": "高評価順",
    "zh": "最高评分",
    "ko": "최고 평점",
    "es": "Mejor valorados"
  },
  "คัดลอก": {
    "en": "Copy",
    "ja": "コピー",
    "zh": "复制",
    "ko": "복사",
    "es": "Copiar"
  },
  "คัดลอกคู่ข้อมูล (ผู้ใช้:รหัสผ่าน)": {
    "en": "Copy credentials (user:pass)",
    "ja": "認証情報をコピー (ユーザー:パスワード)",
    "zh": "复制凭证对 (用户名:密码)",
    "ko": "로그인 정보 복사 (아이디:비밀번호)",
    "es": "Copiar credenciales (usuario:contraseña)"
  },
  "คัดลอกชื่อผู้ใช้": {
    "en": "Copy Username",
    "ja": "ユーザー名をコピー",
    "zh": "复制用户名",
    "ko": "사용자 이름 복사",
    "es": "Copiar nombre de usuario"
  },
  "คัดลอกชื่อผู้ใช้แล้ว": {
    "en": "Username copied",
    "ja": "ユーザー名をコピーしました",
    "zh": "用户名已复制",
    "ko": "사용자 이름이 복사되었습니다",
    "es": "Nombre de usuario copiado"
  },
  "คัดลอกไม่สำเร็จ": {
    "en": "Copy failed",
    "ja": "コピーに失敗しました",
    "zh": "复制失败",
    "ko": "복사 실패",
    "es": "Error al copiar"
  },
  "คัดลอกไม่สำเร็จ:": {
    "en": "Failed to copy:",
    "ja": "コピーに失敗:",
    "zh": "复制失败:",
    "ko": "복사 실패:",
    "es": "Error al copiar:"
  },
  "คัดลอกรหัสผู้ใช้": {
    "en": "Copy User ID",
    "ja": "ユーザーIDをコピー",
    "zh": "复制用户ID",
    "ko": "사용자 ID 복사",
    "es": "Copiar ID de usuario"
  },
  "คัดลอกรหัสผู้ใช้แล้ว": {
    "en": "User ID copied",
    "ja": "ユーザー ID をコピーしました",
    "zh": "用户 ID 已复制",
    "ko": "사용자 ID가 복사되었습니다",
    "es": "ID de usuario copiado"
  },
  "คัดลอกสคริปต์": {
    "en": "Copy Script",
    "ja": "スクリプトをコピー",
    "zh": "复制脚本",
    "ko": "스크립트 복사",
    "es": "Copiar script"
  },
  "คัดลอกสคริปต์สำเร็จ": {
    "en": "Script copied successfully",
    "ja": "スクリプトのコピーに成功しました",
    "zh": "复制脚本成功",
    "ko": "스크립트 복사 성공",
    "es": "Script copiado con éxito"
  },
  "คัดลอกสคริปต์สำเร็จ!": {
    "en": "Script copied successfully!",
    "ja": "スクリプトをコピーしました！",
    "zh": "脚本复制成功！",
    "ko": "스크립트가 복사되었습니다!",
    "es": "¡Script copiado con éxito!"
  },
  "คัดลอกสำเร็จ!": {
    "en": "Copied!",
    "ja": "コピー完了！",
    "zh": "复制成功！",
    "ko": "복사 완료!",
    "es": "¡Copiado!"
  },
  "คัดลอกสำเร็จ": {
    "en": "Copied successfully",
    "ja": "コピーしました",
    "zh": "复制成功",
    "ko": "복사 완료",
    "es": "Copiado con éxito"
  },
  "คัดลอก FastFlags JSON เรียบร้อยแล้ว": {
    "en": "FastFlags JSON copied successfully",
    "ja": "FastFlags JSON をコピーしました",
    "zh": "FastFlags JSON 已成功复制",
    "ko": "FastFlags JSON이 성공적으로 복사되었습니다",
    "es": "FastFlags JSON copiado con éxito"
  },
  "คัดลอก FastFlags JSON เรียบร้อยแล้ว (": {
    "en": "FastFlags JSON copied successfully (",
    "ja": "FastFlags JSONをコピーしました (",
    "zh": "FastFlags JSON 已复制 (",
    "ko": "FastFlags JSON 복사 완료 (",
    "es": "FastFlags JSON copiado con éxito ("
  },
  "คัดลอก JSON": {
    "en": "Copy JSON",
    "ja": "JSON をコピー",
    "zh": "复制 JSON",
    "ko": "JSON 복사",
    "es": "Copiar JSON"
  },
  "คัดลอก Place ID แล้ว": {
    "en": "Place ID copied",
    "ja": "Place ID をコピーしました",
    "zh": "Place ID 已复制",
    "ko": "Place ID가 복사되었습니다",
    "es": "Place ID copiado"
  },
  "ค่ากำหนดของแอป ธีม และเสียง": {
    "en": "App Preferences, Themes, and Audio",
    "ja": "アプリ設定、テーマ、サウンド",
    "zh": "软件偏好设置、主题与声音",
    "ko": "앱 설정, 테마 및 사운드",
    "es": "Preferencias de la app, Temas y Sonidos"
  },
  "ค่าของ Flag (Value)": {
    "en": "Flag Value (Value)",
    "ja": "Flag の値 (Value)",
    "zh": "Flag 数值 (Value)",
    "ko": "Flag 값 (Value)",
    "es": "Valor de Flag (Value)"
  },
  "ค่าเริ่มต้น": {
    "en": "Default",
    "ja": "デフォルト",
    "zh": "默认",
    "ko": "기본값",
    "es": "Predeterminado"
  },
  "ค่าเริ่มต้นของ Roblox (Default)": {
    "en": "Roblox Default (Default)",
    "ja": "Roblox デフォルト",
    "zh": "Roblox 默认值",
    "ko": "Roblox 기본값",
    "es": "Predeterminado de Roblox"
  },
  "ค่าเริ่มต้นมาตรฐานพร้อมปิด Telemetry": {
    "en": "Standard default with telemetry disabled",
    "ja": "テレメトリ無効化済みの標準デフォルト",
    "zh": "已禁用遥测的标准默认设置",
    "ko": "텔레메트리가 비활성화된 표준 기본값",
    "es": "Estándar predeterminado con telemetría desactivada"
  },
  "คำสั่งด่วน": {
    "en": "Quick Actions",
    "ja": "クイックアクション",
    "zh": "快捷操作",
    "ko": "빠른 명령",
    "es": "Acciones rápidas"
  },
  "ค่า (Value)": {
    "en": "Value (Value)",
    "ja": "値 (Value)",
    "zh": "值 (Value)",
    "ko": "값 (Value)",
    "es": "Valor (Value)"
  },
  "คีย์เข้ารหัส": {
    "en": "Encryption Key",
    "ja": "Encryption Key",
    "zh": "加密私钥",
    "ko": "암호화 키",
    "es": "Clave de cifrado"
  },
  "คีย์ไม่ถูกต้อง กรุณาลองอีกครั้ง": {
    "en": "Invalid key. Please try again.",
    "ja": "キーが正しくありません。再試行してください。",
    "zh": "密钥无效。请重试。",
    "ko": "잘못된 키입니다. 다시 시도하세요.",
    "es": "Clave no válida. Por favor reintente."
  },
  "คีย์ API": {
    "en": "API Key",
    "ja": "APIキー",
    "zh": "API 密钥",
    "ko": "API 키",
    "es": "Clave API"
  },
  "คืนค่าความโปร่งใส 100%": {
    "en": "Restore 100% Opacity",
    "ja": "透明度を 100% に復元",
    "zh": "恢复 100% 不透明度",
    "ko": "투명도 100% 복원",
    "es": "Restaurar 100% de opacidad"
  },
  "คืนค่าความโปร่งใส 100": {
    "en": "Restore 100% Opacity",
    "ja": "透明度を 100% に復元",
    "zh": "恢复 100% 不透明度",
    "ko": "투명도 100% 복원",
    "es": "Restaurar 100% de opacidad"
  },
  "คืนค่าความโปร่งใส 100% เรียบร้อยแล้ว": {
    "en": "Restored 100% opacity successfully",
    "ja": "透明度を 100% に復元しました",
    "zh": "已成功恢复 100% 不透明度",
    "ko": "투명도가 100%로 복원되었습니다",
    "es": "Opacidad al 100% restaurada con éxito"
  },
  "คืนค่ามาตรฐานดั้งเดิมของ Roblox พร้อมบล็อกการส่งข้อมูลวิเคราะห์ Telemetry เพื่อความเป็นส่วนตัว": {
    "en": "Restores Roblox defaults while blocking telemetry analytics for privacy",
    "ja": "プライバシーのためテレメトリ送信を遮断しつつ Roblox 標準状態に復元",
    "zh": "恢复 Roblox 原生默认配置，同时阻止遥测数据外传以保护隐私",
    "ko": "개인정보 보호를 위해 텔레메트리 수집을 차단하고 Roblox 기본값으로 복원",
    "es": "Restaura los valores estándar de Roblox bloqueando la telemetría por privacidad"
  },
  "คืนค่าเริ่มต้น": {
    "en": "Reset to Defaults",
    "ja": "初期値に戻す",
    "zh": "恢复默认",
    "ko": "기본값 복원",
    "es": "Restablecer valores predeterminados"
  },
  "คืนค่า FPS ปกติทันทีเมื่อคลิกกลับมาเล่น": {
    "en": "Restore normal FPS immediately when focusing back to game",
    "ja": "ゲームにフォーカスが戻った際に通常のFPSを即座に復元",
    "zh": "重新聚焦到游戏窗口时立即恢复正常 FPS",
    "ko": "게임 창으로 포커스 복귀 시 정상 FPS 즉시 복원",
    "es": "Restaura los FPS normales al volver a enfocar la ventana"
  },
  "คุกกี้ของบัญชีนี้ไม่ถูกต้องแล้ว เพิ่มบัญชีใหม่เพื่ออัปเดต": {
    "en": "Cookie is invalid. Add the account again to update it.",
    "ja": "クッキーが無効です。更新するにはアカウントを再追加してください。",
    "zh": "Cookie 已失效。请重新添加该账户以更新。",
    "ko": "쿠키가 유효하지 않습니다. 계정을 다시 추가하여 업데이트하세요.",
    "es": "La cookie ya no es válida. Vuelve a añadir la cuenta para actualizar."
  },
  "คุกกี้จะถูกเข้ารหัสและเก็บไว้ในเครื่องเท่านั้น ไม่มีอะไรออกจากอุปกรณ์ของคุณ": {
    "en": "Cookies are encrypted and stored locally only. Nothing leaves your device.",
    "ja": "クッキーは暗号化されてローカルのみに保存。外部に送信されません。",
    "zh": "Cookie 会加密且仅存储在本地，没有任何数据离开您的设备。",
    "ko": "쿠키는 암호화되어 로컬에만 저장됩니다. 어떠한 데이터도 외부로 전송되지 않습니다.",
    "es": "Cookies cifradas y locales. Nada sale de tu dispositivo."
  },
  "คุกกี้ไม่ถูกต้อง": {
    "en": "Invalid Cookie",
    "ja": "無効なクッキー",
    "zh": "无效 Cookie",
    "ko": "유효하지 않은 쿠키",
    "es": "Cookie no válida"
  },
  "คุกกี้ไม่ถูกต้องหรือหมดอายุ": {
    "en": "Cookie is invalid or expired",
    "ja": "クッキーが無効または期限切れです",
    "zh": "Cookie 无效或已过期",
    "ko": "쿠키가 유효하지 않거나 만료되었습니다",
    "es": "La cookie no es válida o ha caducado"
  },
  "คุณต้องการเข้าสู่ระบบอย่างไร?": {
    "en": "How would you like to log in?",
    "ja": "ログイン方法を選択してください",
    "zh": "您希望如何登录？",
    "ko": "어떻게 로그인하시겠습니까?",
    "es": "¿Cómo deseas iniciar sesión?"
  },
  "คุณต้องการเข้าสู่ระบบอย่างไร": {
    "en": "How would you like to log in",
    "ja": "ログイン方法を選択してください",
    "zh": "您希望如何登录",
    "ko": "어떻게 로그인하시겠습니까",
    "es": "Cómo deseas iniciar sesión"
  },
  "คุณต้องการยกเลิกรหัสผ่านการล็อกโปรแกรมใช่หรือไม่? เมื่อยกเลิกแล้ว ใครก็สามารถเปิดเข้าโปรแกรมได้โดยไม่ต้องใส่รหัสผ่าน": {
    "en": "Do you want to remove app lock password? Anyone will be able to access without entering a password.",
    "ja": "アプリロックパスワードを解除しますか？解除後はパスワードなしでアクセス可能になります。",
    "zh": "您确定要取消程序锁密码吗？取消后任何人都可以无需密码访问。",
    "ko": "앱 잠금 비밀번호를 해제하시겠습니까? 해제 시 비밀번호 없이 접근할 수 있습니다.",
    "es": "¿Deseas quitar la contraseña de bloqueo? Cualquiera podrá acceder sin contraseña."
  },
  "คุณต้องการรีเซ็ตการตั้งค่า Voidstrap FastFlags ทั้งหมดเป็นค่าเริ่มต้นหรือไม่": {
    "en": "Do you want to reset all Voidstrap FastFlags settings to defaults?",
    "ja": "Voidstrap FastFlags のすべての設定をデフォルトにリセットしますか？",
    "zh": "您确定要将所有 Voidstrap FastFlags 设置恢复为默认值吗？",
    "ko": "모든 Voidstrap FastFlags 설정을 기본값으로 초기화하시겠습니까?",
    "es": "¿Deseas restablecer todos los ajustes de Voidstrap FastFlags a los predeterminados?"
  },
  "คุณต้องการรีเซ็ตการตั้งค่า Voidstrap FastFlags ทั้งหมดเป็นค่าเริ่มต้นหรือไม่?": {
    "en": "Do you want to reset all Voidstrap FastFlags settings to default?",
    "ja": "すべてのVoidstrap FastFlags設定をデフォルトにリセットしますか？",
    "zh": "是否将所有 Voidstrap FastFlags 设置重置为默认值？",
    "ko": "모든 Voidstrap FastFlags 설정을 기본값으로 재설정하시겠습니까?",
    "es": "¿Deseas restablecer todos los FastFlags de Voidstrap a los valores predeterminados?"
  },
  "คุณแน่ใจหรือไม่ที่จะรีเซ็ตรหัสผ่านหลัก? บัญชีและข้อมูลทั้งหมดจะถูกลบ": {
    "en": "Are you sure you want to reset master password? All accounts and data will be deleted.",
    "ja": "マスターパスワードをリセットしてもよろしいですか？すべてのアカウントとデータが削除されます。",
    "zh": "您确定要重置主密码吗？所有账户和数据将被彻底删除。",
    "ko": "마스터 비밀번호를 재설정하시겠습니까? 모든 계정과 데이터가 삭제됩니다.",
    "es": "¿Seguro que deseas restablecer la contraseña maestra? Se borrarán todos los datos."
  },
  "คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์": {
    "en": "Are you sure you want to delete profile",
    "ja": "プロファイルを削除してもよろしいですか:",
    "zh": "您确定要删除配置文件吗:",
    "ko": "프로필을 삭제하시겠습니까:",
    "es": "¿Estás seguro de que deseas eliminar el perfil"
  },
  "คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์ \"": {
    "en": "Are you sure you want to delete profile \"",
    "ja": "プロファイル「",
    "zh": "您确定要删除配置文件 “",
    "ko": "프로필 \"",
    "es": "¿Estás seguro de que deseas eliminar el perfil \""
  },
  "คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์ \"{0}\"?": {
    "en": "Are you sure you want to delete profile \"{0}\"?",
    "ja": "プロファイル「{0}」を削除してもよろしいですか？",
    "zh": "确定要删除配置文件“{0}”吗？",
    "ko": "프로필 \"{0}\"을(를) 삭제하시겠습니까?",
    "es": "¿Estás seguro de que deseas eliminar el perfil \"{0}\"?"
  },
  "คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้": {
    "en": "Are you sure you want to delete this profile? This action cannot be undone.",
    "ja": "このプロファイルを削除してもよろしいですか？この操作は元に戻せません。",
    "zh": "您确定要删除此配置文件吗？此操作无法撤销。",
    "ko": "이 프로필을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    "es": "¿Estás seguro de que deseas eliminar este perfil? Esta acción no se puede deshacer."
  },
  "คุณแน่ใจหรือไม่ว่าต้องการลบ FastFlags ทั้งหมด": {
    "en": "Are you sure you want to delete all FastFlags?",
    "ja": "すべての FastFlags を削除してもよろしいですか？",
    "zh": "您确定要删除所有 FastFlags 吗？",
    "ko": "정말로 모든 FastFlags를 삭제하시겠습니까?",
    "es": "¿Estás seguro de que deseas eliminar todos los FastFlags?"
  },
  "คุณแน่ใจหรือไม่ว่าต้องการลบ FastFlags ทั้งหมด ({0} รายการ)?": {
    "en": "Are you sure you want to delete all FastFlags ({0} items)?",
    "ja": "すべてのFastFlags ({0} 件) を削除してもよろしいですか？",
    "zh": "您确定要删除所有 FastFlags（{0} 项）吗？",
    "ko": "모든 FastFlags({0}개 항목)를 삭제하시겠습니까?",
    "es": "¿Seguro que deseas eliminar todos los FastFlags ({0} elementos)?"
  },
  "คุณแน่ใจหรือไม่ว่าต้องการล้างพิกัดตำแหน่งหน้าต่างทั้งหมด? (Roblox จะเปิดในตำแหน่งเริ่มต้นของระบบปกติ)": {
    "en": "Clear all window coordinates? Roblox windows will open in default system positions.",
    "ja": "すべてのウィンドウ座標をクリアしますか？(Roblox はシステムデフォルトの位置で開きます)",
    "zh": "确认清除所有窗口坐标吗？(Roblox 将在系统默认位置打开)",
    "ko": "모든 창 좌표를 초기화하시겠습니까? (Roblox가 시스템 기본 위치에서 실행됩니다)",
    "es": "¿Borrar todas las coordenadas? Roblox se abrirá en la posición predeterminada."
  },
  "คุณภาพกราฟิก": {
    "en": "Graphics Quality",
    "ja": "グラフィック品質",
    "zh": "画质质量",
    "ko": "그래픽 품질",
    "es": "Calidad gráfica"
  },
  "คุณภาพกราฟิกจะถูกบันทึกลง Fast Flags และมีผลเมื่อเปิดครั้งถัดไป ใช้": {
    "en": "Graphics quality will be saved to Fast Flags and takes effect next launch. Use",
    "ja": "グラフィック品質は Fast Flags に保存され次回起動時に適用されます。使用:",
    "zh": "画质设置将保存至 Fast Flags 并在下次启动时生效。使用",
    "ko": "그래픽 품질은 Fast Flags에 저장되어 다음 실행 시 적용됩니다. 사용:",
    "es": "La calidad gráfica se guardará en Fast Flags y se aplicará al reiniciar. Usa"
  },
  "คุณสามารถวางไฟล์ม็อดเนื้อหาเสริม (เช่น สกิน, แมพ, Skybox, แอนิเมชัน) ลงในโฟลเดอร์ Mod ของ MultiRoblox ได้โดยตรง เมื่อกด \"ติดตั้ง Mods\" ระบบจะซิงค์ไฟล์ไปยังตัวเกมทันที": {
    "en": "You can place custom mod files (skins, maps, skyboxes, animations) into the MultiRoblox Mod folder. Clicking \"Install Mods\" syncs them to Roblox instantly.",
    "ja": "スキン、マップ、Skybox、アニメーションなどのModファイルを MultiRoblox の Mod フォルダに配置できます。「Mod をインストール」を押すと即座に反映されます。",
    "zh": "您可以将自定义扩展内容文件 (如皮肤、地图、Skybox、动画) 直接放入 MultiRoblox 的 Mod 文件夹中。点击“安装 Mods”后系统将立即同步到游戏中。",
    "ko": "스킨, 맵, 스카이박스, 애니메이션 등의 커스텀 모드 파일을 MultiRoblox의 Mod 폴더에 직접 넣을 수 있습니다. \"모드 설치\"를 누르면 게임에 즉시 동기화됩니다.",
    "es": "Puedes colocar archivos de mods (skins, mapas, skybox, animaciones) en la carpeta Mod. Al pulsar \"Instalar Mods\" se sincronizarán al instante."
  },
  "คู่ข้อมูล": {
    "en": "Credentials Pair",
    "ja": "認証情報ペア",
    "zh": "凭证对",
    "ko": "인증 정보 쌍",
    "es": "Par de credenciales"
  },
  "เครดิต": {
    "en": "Credits",
    "ja": "クレジット",
    "zh": "致谢",
    "ko": "クレジット",
    "es": "Créditos"
  },
  "เคอร์เซอร์กำหนดเอง (Custom Image)": {
    "en": "Custom Cursor Image",
    "ja": "カスタムカーソル画像 (Custom Image)",
    "zh": "自定义鼠标指针 (Custom Image)",
    "ko": "사용자 지정 커서 이미지 (Custom Image)",
    "es": "Cursor personalizado"
  },
  "เคอร์เซอร์เมาส์ในเกม (Mouse Cursor Mod)": {
    "en": "In-Game Mouse Cursor Mod",
    "ja": "ゲーム内マウスポインター (Mouse Cursor Mod)",
    "zh": "游戏内鼠标指针 Mod (Mouse Cursor Mod)",
    "ko": "게임 내 마우스 커서 모드 (Mouse Cursor Mod)",
    "es": "Cursor del ratón en el juego (Mouse Cursor Mod)"
  },
  "จอ)": {
    "en": "windows)",
    "ja": "画面)",
    "zh": "个窗口)",
    "ko": "개 화면)",
    "es": "pantallas)"
  },
  "จอเข้าพิกัดเรียบร้อย": {
    "en": "windows aligned to coordinates",
    "ja": "画面を座標に整列しました",
    "zh": "个窗口已对齐坐标",
    "ko": "개 화면 좌표 정렬 완료",
    "es": "ventanas alineadas a coordenadas"
  },
  "จอเรียบร้อยแล้ว": {
    "en": "windows completed",
    "ja": "画面の処理が完了しました",
    "zh": "个窗口已处理完成",
    "ko": "개 화면 정렬 완료",
    "es": "ventanas completadas"
  },
  "จัดกลุ่มบัญชีและเปิดพร้อมกันได้ในคลิกเดียว": {
    "en": "Group accounts and launch them all in one click",
    "ja": "アカウントをグループ化し、ワンクリックで同時起動",
    "zh": "对账户进行分组，点击一次即可同时启动",
    "ko": "계정을 그룹화하고 원클릭으로 동시 실행",
    "es": "Agrupar cuentas y abrirlas con un clic"
  },
  "จัดการบัญชี": {
    "en": "Manage Accounts",
    "ja": "アカウント管理",
    "zh": "管理账户",
    "ko": "계정 관리",
    "es": "Gestionar cuentas"
  },
  "จัดการรหัสผ่านเข้าใช้งาน": {
    "en": "Manage App Password",
    "ja": "ログインパスワード管理",
    "zh": "管理应用访问密码",
    "ko": "앱 접속 비밀번호 관리",
    "es": "Gestionar contraseña de la app"
  },
  "จัดระเบียบหน้าต่าง Roblox": {
    "en": "Arrange Roblox Windows",
    "ja": "Roblox ウィンドウを整列",
    "zh": "整理 Roblox 窗口",
    "ko": "Roblox 창 정렬",
    "es": "Organizar ventanas de Roblox"
  },
  "จัดระเบียบหน้าต่าง Roblox {0} จอเข้าพิกัดเรียบร้อย!": {
    "en": "Organized {0} Roblox windows into grid coordinates!",
    "ja": "{0} 個のRobloxウィンドウをグリッド座標に整列しました！",
    "zh": "已将 {0} 个 Roblox 窗口整理到网格坐标！",
    "ko": "{0}개의 Roblox 창을 그리드 좌표로 정리했습니다!",
    "es": "¡{0} ventanas de Roblox organizadas en cuadrícula!"
  },
  "จัดรูปแบบ (Format)": {
    "en": "Format Code",
    "ja": "コード整形 (Format)",
    "zh": "格式化 (Format)",
    "ko": "코드 정렬 (Format)",
    "es": "Dar formato"
  },
  "จัดรูปแบบ JSON เรียบร้อยแล้ว": {
    "en": "JSON formatted successfully",
    "ja": "JSON を整形しました",
    "zh": "JSON 格式化成功",
    "ko": "JSON 정렬 완료",
    "es": "JSON formateado con éxito"
  },
  "จัดรูปแบบ JSON สำเร็จ": {
    "en": "JSON formatted successfully",
    "ja": "JSON を整形しました",
    "zh": "JSON 格式化成功",
    "ko": "JSON 정렬 완료",
    "es": "JSON formateado con éxito"
  },
  "จัดเรียงแบบ Grid Snap": {
    "en": "Grid Snap Arrangement",
    "ja": "グリッドスナップ配置",
    "zh": "网格吸附对齐",
    "ko": "그리드 스냅 정렬",
    "es": "Alineación por cuadrícula"
  },
  "จัดเรียงหน้าต่าง": {
    "en": "Arrange Windows",
    "ja": "ウィンドウを整列",
    "zh": "排列窗口",
    "ko": "창 정렬",
    "es": "Organizar ventanas"
  },
  "จัดเรียงหน้าต่าง {0} จอเรียบร้อยแล้ว": {
    "en": "Arranged {0} windows successfully",
    "ja": "{0} 個のウィンドウを整列しました",
    "zh": "已成功排列 {0} 个窗口",
    "ko": "{0}개 창 정렬 완료",
    "es": "{0} ventanas organizadas con éxito"
  },
  "จัดเรียงหน้าต่างไม่สำเร็จ": {
    "en": "Failed to arrange windows",
    "ja": "ウィンドウの整列に失敗しました",
    "zh": "排列窗口失败",
    "ko": "창 정렬 실패",
    "es": "Error al organizar ventanas"
  },
  "จัดเรียงหน้าต่างไม่สำเร็จ:": {
    "en": "Failed to arrange windows:",
    "ja": "ウィンドウの整列に失敗:",
    "zh": "排列窗口失败:",
    "ko": "창 정렬 실패:",
    "es": "Error al organizar ventanas:"
  },
  "จัดเรียงหน้าต่างเรียบร้อยแล้ว": {
    "en": "Windows arranged successfully",
    "ja": "ウィンドウを整列しました",
    "zh": "窗口已成功排列",
    "ko": "창이 성공적으로 정렬되었습니다",
    "es": "Ventanas organizadas con éxito"
  },
  "จัดเรียงหน้าต่างและพิกัดการแสดงผล Roblox แบบอิสระ": {
    "en": "Freely arrange Roblox window positions and display layouts",
    "ja": "Roblox ウィンドウの位置と配置を自由に整列",
    "zh": "自由排列 Roblox 窗口位置及显示布局",
    "ko": "Roblox 창 위치 및 표시 레이아웃 자유 정렬",
    "es": "Organiza libremente las ventanas y posiciones de Roblox"
  },
  "จัดเรียงหน้าต่างให้อัตโนมัติเมื่อเปิดบัญชีใหม่": {
    "en": "Automatically arrange windows when opening new accounts",
    "ja": "新しいアカウントを開く際にウィンドウを自動整列",
    "zh": "打开新账户时自动对齐窗口",
    "ko": "새 계정을 실행할 때 창을 자동으로 정렬합니다",
    "es": "Organizar ventanas automáticamente al abrir una cuenta"
  },
  "จัดเรียง Grid Snap ทันที": {
    "en": "Snap to Grid Now",
    "ja": "今すぐグリッドに整列",
    "zh": "立即吸附网格",
    "ko": "지금 그리드 스냅 정렬",
    "es": "Ajustar a cuadrícula ahora"
  },
  "จัดเรียง Grid Snap อัตโนมัติ (Auto Grid)": {
    "en": "Auto Grid Snap",
    "ja": "自動グリッドスナップ (Auto Grid)",
    "zh": "自动网格吸附 (Auto Grid)",
    "ko": "자동 그리드 스냅 (Auto Grid)",
    "es": "Ajuste automático a cuadrícula"
  },
  "จัดหน้าต่าง": {
    "en": "Window Layout",
    "ja": "ウィンドウ配置",
    "zh": "窗口布局",
    "ko": "창 레이아웃",
    "es": "Diseño de ventanas"
  },
  "จัดหน้าต่าง (Window Layout)": {
    "en": "Window Layout",
    "ja": "ウィンドウ配置 (Window Layout)",
    "zh": "窗口布局 (Window Layout)",
    "ko": "창 레이아웃 (Window Layout)",
    "es": "Diseño de ventanas (Window Layout)"
  },
  "จาก": {
    "en": "From",
    "ja": "から",
    "zh": "来自",
    "ko": "출처:",
    "es": "Desde"
  },
  "จาก Roblox CDN": {
    "en": "from Roblox CDN",
    "ja": "Roblox CDN から",
    "zh": "来自 Roblox CDN",
    "ko": "Roblox CDN에서",
    "es": "desde Roblox CDN"
  },
  "จำกัดอัตราเฟรม Roblox ที่อยู่เบื้องหลังเพื่อประหยัดทรัพยากรเครื่อง (CPU/GPU/RAM)": {
    "en": "Limits background Roblox FPS to save CPU, GPU, and RAM resources",
    "ja": "バックグラウンドの Roblox FPS を制限して CPU/GPU/RAM を節約",
    "zh": "限制后台 Roblox 帧率以大幅节约系统硬件资源 (CPU/GPU/RAM)",
    "ko": "백그라운드 Roblox 프레임을 제한하여 CPU/GPU/RAM 리소스를 절약합니다",
    "es": "Limita los FPS de Roblox en segundo plano para ahorrar CPU/GPU/RAM"
  },
  "จำกัด FPS": {
    "en": "FPS Cap",
    "ja": "FPS制限",
    "zh": "帧率限制",
    "ko": "FPS 제한",
    "es": "Límite de FPS"
  },
  "จำกัด FPS หน้าต่างเบื้องหลัง (FPS Capper)": {
    "en": "Background Window FPS Capper",
    "ja": "バックグラウンド FPS 制限 (FPS Capper)",
    "zh": "后台窗口 FPS 限制 (FPS Capper)",
    "ko": "백그라운드 창 FPS 제한 (FPS Capper)",
    "es": "Límite de FPS en segundo plano"
  },
  "จำลองการกดกระโดดอย่างปลอดภัย": {
    "en": "Safely simulates spacebar jump",
    "ja": "安全なジャンプキー入力をシミュレート",
    "zh": "安全模拟跳跃动作",
    "ko": "안전하게 점프 동작 시뮬레이션",
    "es": "Simula el salto de forma segura"
  },
  "จำลองการกดแป้น Alt+Tab เพื่อเปลี่ยนโฟกัส": {
    "en": "Simulates Alt+Tab keypress to switch focus",
    "ja": "Alt+Tabキー入力をシミュレートしてフォーカスを切り替えます",
    "zh": "模拟按 Alt+Tab 键切换焦点",
    "ko": "Alt+Tab 키 입력을 시뮬레이션하여 포커스를 전환합니다",
    "es": "Simula la pulsación de Alt+Tab para cambiar de foco"
  },
  "จำลองการขยับเมาส์/คีย์บอร์ดเสมือนจริง": {
    "en": "Simulates realistic mouse/keyboard input",
    "ja": "リアルなマウス/キーボード入力をシミュレート",
    "zh": "模拟真实鼠标/键盘输入动作",
    "ko": "실제 마우스/키보드 조작을 시뮬레이션",
    "es": "Simula movimiento de ratón y teclado realista"
  },
  "แจ้งเตือนเสียง/ข้อความเมื่อใกล้ถึงเวลา 20 นาที": {
    "en": "Sound/Text notification when nearing 20-minute limit",
    "ja": "20分制限が近づいた際に音声/テキストで通知",
    "zh": "接近 20 分钟限制时发出声音/文字提醒",
    "ko": "20분 유휴 제한에 도달하기 전 소리/텍스트로 알림",
    "es": "Notificación sonora/texto cerca de los 20 minutos"
  },
  "แจ้งเตือน AFK Reminder (นาทีที่ 18)": {
    "en": "AFK Reminder Alert (18th Minute)",
    "ja": "AFK リマインダー通知 (18分経過時)",
    "zh": "防挂机提醒警报 (第 18 分钟)",
    "ko": "AFK 알림 경고 (18분 경과 시)",
    "es": "Alerta recordatoria de AFK (minuto 18)"
  },
  "เฉพาะในเครื่อง": {
    "en": "Local Only",
    "ja": "ローカルのみ",
    "zh": "仅限本地",
    "ko": "로컬 전용",
    "es": "Solo local"
  },
  "ช่วงเวลาการทำงาน (AFK Interval)": {
    "en": "AFK Action Interval",
    "ja": "AFK 動作間隔 (AFK Interval)",
    "zh": "防挂机执行间隔 (AFK Interval)",
    "ko": "AFK 동작 주기 (AFK Interval)",
    "es": "Intervalo de acción AFK"
  },
  "ช่วงเวลาหน่วงระหว่างเปิดบัญชี": {
    "en": "Account Launch Interval Delay",
    "ja": "アカウント起動間の遅延時間",
    "zh": "账户启动间隔延迟",
    "ko": "계정 실행 간 지연 시간",
    "es": "Intervalo de retraso entre inicios de cuentas"
  },
  "ชั่วโมงที่แล้ว": {
    "en": "hours ago",
    "ja": "時間前",
    "zh": "小时前",
    "ko": "시간 전",
    "es": "horas atrás"
  },
  "ชื่อกลุ่ม": {
    "en": "Package Name",
    "ja": "グループ名",
    "zh": "群组名称",
    "ko": "그룹 이름",
    "es": "Nombre del grupo"
  },
  "ชื่อตัวละคร": {
    "en": "Character Name",
    "ja": "キャラクター名",
    "zh": "角色名称",
    "ko": "캐릭터 이름",
    "es": "Nombre del personaje"
  },
  "ชื่อบัญชี (ก-ฮ)": {
    "en": "Name (A-Z)",
    "ja": "名前順 (A-Z)",
    "zh": "名称 (A-Z)",
    "ko": "이름순 (A-Z)",
    "es": "Nombre (A-Z)"
  },
  "ชื่อเล่น": {
    "en": "Nickname",
    "ja": "ニックネーム",
    "zh": "昵称",
    "ko": "별명",
    "es": "Apodo"
  },
  "ชื่อ FastFlag": {
    "en": "FastFlag Name",
    "ja": "FastFlag 名",
    "zh": "FastFlag 名称",
    "ko": "FastFlag 이름",
    "es": "Nombre de FastFlag"
  },
  "ชื่อ Flag (Flag Key)": {
    "en": "Flag Name (Flag Key)",
    "ja": "Flag 名 (Flag Key)",
    "zh": "Flag 名称 (Flag Key)",
    "ko": "Flag 이름 (Flag Key)",
    "es": "Nombre de Flag (Flag Key)"
  },
  "เช่น 0": {
    "en": "e.g. 0",
    "ja": "例: 0",
    "zh": "例: 0",
    "ko": "예: 0",
    "es": "ej. 0"
  },
  "เช่น 600": {
    "en": "e.g. 600",
    "ja": "例: 600",
    "zh": "例: 600",
    "ko": "예: 600",
    "es": "ej. 600"
  },
  "เช่น 6872265039 หรือ https://www.roblox.com/share?...": {
    "en": "e.g. 6872265039 or https://www.roblox.com/share?...",
    "ja": "例: 6872265039 または https://www.roblox.com/share?...",
    "zh": "例如 6872265039 或 https://www.roblox.com/share?...",
    "ko": "예: 6872265039 또는 https://www.roblox.com/share?...",
    "es": "ej. 6872265039 o https://www.roblox.com/share?..."
  },
  "เช่น 6872265039 หรือ https://www.roblox.com/share": {
    "en": "e.g. 6872265039 or https://www.roblox.com/share",
    "ja": "例: 6872265039 または https://www.roblox.com/share",
    "zh": "例如 6872265039 或 https://www.roblox.com/share",
    "ko": "예: 6872265039 또는 https://www.roblox.com/share",
    "es": "ej. 6872265039 o https://www.roblox.com/share"
  },
  "เช่น 800": {
    "en": "e.g. 800",
    "ja": "例: 800",
    "zh": "例: 800",
    "ko": "예: 800",
    "es": "ej. 800"
  },
  "เช่น --app หรือ -silent": {
    "en": "e.g. --app or -silent",
    "ja": "例: --app または -silent",
    "zh": "例如 --app 或 -silent",
    "ko": "예: --app 또는 -silent",
    "es": "ej. --app o -silent"
  },
  "เช่น Farm Squad หรือ Trading Alts": {
    "en": "e.g. Farm Squad or Trading Alts",
    "ja": "例: Farm Squad または Trading Alts",
    "zh": "例如 Farm Squad 或 Trading Alts",
    "ko": "예: Farm Squad 또는 Trading Alts",
    "es": "ej. Farm Squad o Trading Alts"
  },
  "เช่น FFlagDisablePostFx หรือ DFIntTaskSchedulerTargetFps": {
    "en": "e.g. FFlagDisablePostFx or DFIntTaskSchedulerTargetFps",
    "ja": "例: FFlagDisablePostFx または DFIntTaskSchedulerTargetFps",
    "zh": "例如 FFlagDisablePostFx 或 DFIntTaskSchedulerTargetFps",
    "ko": "예: FFlagDisablePostFx 또는 DFIntTaskSchedulerTargetFps",
    "es": "ej. FFlagDisablePostFx o DFIntTaskSchedulerTargetFps"
  },
  "เช่น MainAlt หรือ FarmBot": {
    "en": "e.g. MainAlt or FarmBot",
    "ja": "例: MainAlt または FarmBot",
    "zh": "例如 MainAlt 或 FarmBot",
    "ko": "예: MainAlt 또는 FarmBot",
    "es": "ej. MainAlt o FarmBot"
  },
  "เช่น SecureKey1234@A#": {
    "en": "e.g. SecureKey1234@A#",
    "ja": "例: SecureKey1234@A#",
    "zh": "例如 SecureKey1234@A#",
    "ko": "예: SecureKey1234@A#",
    "es": "ej. SecureKey1234@A#"
  },
  "เช่น SecureKey1234@A": {
    "en": "e.g. SecureKey1234@A",
    "ja": "例: SecureKey1234@A",
    "zh": "例如 SecureKey1234@A",
    "ko": "예: SecureKey1234@A",
    "es": "ej. SecureKey1234@A"
  },
  "เชื่อมต่อ & แจ้งเตือน": {
    "en": "Connection & Alerts",
    "ja": "接続と通知",
    "zh": "连接与警报",
    "ko": "연결 및 알림",
    "es": "Conexión y alertas"
  },
  "เชื่อมต่อแล้ว": {
    "en": "Connected",
    "ja": "接続済み",
    "zh": "已连接",
    "ko": "연결됨",
    "es": "Conectado"
  },
  "เชื่อมต่อและส่งสถานะไปยัง Discord สำเร็จแล้ว": {
    "en": "Connected and sent status to Discord successfully",
    "ja": "Discord に接続しステータスを送信しました",
    "zh": "已成功连接并发送状态至 Discord",
    "ko": "Discord에 연결하여 상태를 성공적으로 전송했습니다",
    "es": "Conectado y enviado estado a Discord con éxito"
  },
  "เชื่อมต่อและส่งสถานะไปยัง Discord สำเร็จแล้ว!": {
    "en": "Connected and updated Discord Rich Presence successfully!",
    "ja": "Discordに接続してステータスを更新しました！",
    "zh": "已成功连接并更新 Discord 状态！",
    "ko": "Discord에 연결하여 상태를 업데이트했습니다!",
    "es": "¡Conectado y actualizado el estado en Discord con éxito!"
  },
  "เชื่อมต่อหน้าเว็บ Roblox ไม่สำเร็จ": {
    "en": "Failed to connect to Roblox website",
    "ja": "Roblox サイトへの接続に失敗しました",
    "zh": "连接 Roblox 网页失败",
    "ko": "Roblox 웹페이지 연결 실패",
    "es": "Error al conectar con la web de Roblox"
  },
  "เชื่อมต่อใหม่อัตโนมัติ (Auto Reconnect)": {
    "en": "Auto Reconnect",
    "ja": "自動再接続 (Auto Reconnect)",
    "zh": "自动重连 (Auto Reconnect)",
    "ko": "자동 재연결 (Auto Reconnect)",
    "es": "Reconexión automática"
  },
  "ใช้เข้ารหัสคุกกี้ที่เก็บไว้บนดิสก์": {
    "en": "Used to encrypt cookies stored on disk",
    "ja": "ディスク上のクッキーを暗号化するために使用",
    "zh": "用于加密存储在本地磁盘的 Cookie",
    "ko": "디스크에 저장된 쿠키를 암호화하는 데 사용됩니다",
    "es": "Usado para cifrar las cookies en el disco"
  },
  "ใช้ค่าแล้วเปิดใหม่สำหรับที่กำลังรัน": {
    "en": "Apply & relaunch running instances",
    "ja": "設定を適用して再起動",
    "zh": "对运行中实例应用并重启",
    "ko": "실행 중인 인스턴스에 적용 및 재실행",
    "es": "Aplicar y reiniciar en ejecución"
  },
  "ใช้งานได้ก่อน": {
    "en": "Valid first",
    "ja": "有効優先",
    "zh": "优先有效",
    "ko": "유효 계정 우선",
    "es": "Válidas primero"
  },
  "ใช้งานไม่ได้ก่อน": {
    "en": "Invalid first",
    "ja": "無効優先",
    "zh": "优先失效",
    "ko": "만료 계정 우선",
    "es": "Expiradas primero"
  },
  "ใช้ไฟล์ .mp3 หรือ .wav เป็นเสียงคลิกได้ ควรสั้น ๆ": {
    "en": "Use .mp3 or .wav for click sounds (short audio recommended)",
    "ja": ".mp3 または .wav をクリック音として使用可能 (短いファイル推奨)",
    "zh": "可使用 .mp3 或 .wav 文件作为点击音效 (建议较短文件)",
    "ko": ".mp3 또는 .wav 파일을 클릭음으로 사용 가능 (짧은 파일 권장)",
    "es": "Usa archivos .mp3 o .wav para el sonido de clic (se recomienda corto)"
  },
  "ใช่ไหม? การกระทำนี้ย้อนกลับไม่ได้": {
    "en": "? This action cannot be undone.",
    "ja": "？この操作は元に戻せません。",
    "zh": "？此操作无法撤销。",
    "ko": "? 이 작업은 되돌릴 수 없습니다.",
    "es": "¿ Esta acción no se puede deshacer."
  },
  "\" ใช่ไหม? การกระทำนี้ย้อนกลับไม่ได้": {
    "en": "\"? This action cannot be undone.",
    "ja": "\"？この操作は元に戻せません。",
    "zh": "\"？此操作无法撤销。",
    "ko": "\"? 이 작업은 되돌릴 수 없습니다.",
    "es": "\"? Esta acción no se puede deshacer."
  },
  "ใช่ไหม? บัญชีภายในจะไม่ถูกลบ": {
    "en": "? Internal accounts will not be deleted.",
    "ja": "？内部のアカウントは削除されません。",
    "zh": "？内部账户不会被删除。",
    "ko": "? 내부 계정은 삭제되지 않습니다.",
    "es": "¿ Las cuentas internas no se eliminarán."
  },
  "\" ใช่ไหม? บัญชีภายในจะไม่ถูกลบ": {
    "en": "\"? Internal accounts will not be deleted.",
    "ja": "\"？内部のアカウントは削除されません。",
    "zh": "\"？内部账户不会被删除。",
    "ko": "\"? 내부 계정은 삭제되지 않습니다.",
    "es": "\"? Las cuentas internas no se eliminarán."
  },
  "ใช้ Roblox Client ทั่วไป": {
    "en": "Use Standard Roblox Client",
    "ja": "標準の Roblox クライアントを使用",
    "zh": "使用标准 Roblox 客户端",
    "ko": "일반 Roblox 클라이언트 사용",
    "es": "Usar cliente estándar de Roblox"
  },
  "ซ่อนชื่อบัญชี Roblox (Hide Usernames)": {
    "en": "Hide Roblox Usernames",
    "ja": "Roblox ユーザー名を隠す (Hide Usernames)",
    "zh": "隐藏 Roblox 用户名 (Hide Usernames)",
    "ko": "Roblox 사용자 이름 숨기기 (Hide Usernames)",
    "es": "Ocultar nombres de usuario de Roblox"
  },
  "ซ่อนชื่อแมพที่กำลังเล่น (Hide Game Details / Streamer Mode)": {
    "en": "Hide Game Details (Streamer Mode)",
    "ja": "プレイ中のマップ名を隠す (Streamer Mode)",
    "zh": "隐藏正在游玩的地图名称 (主播模式)",
    "ko": "플레이 중인 맵 이름 숨기기 (스트리머 모드)",
    "es": "Ocultar detalles del juego (Modo Streamer)"
  },
  "ซ่อนทั้งหมด": {
    "en": "Hide All",
    "ja": "すべて非表示",
    "zh": "全部隐藏",
    "ko": "모두 숨기기",
    "es": "Ocultar todo"
  },
  "ซ่อนทุกหน้าต่าง Roblox": {
    "en": "Hide All Roblox Windows",
    "ja": "すべての Roblox ウィンドウを非表示",
    "zh": "隐藏所有 Roblox 窗口",
    "ko": "모든 Roblox 창 숨기기",
    "es": "Ocultar todas las ventanas de Roblox"
  },
  "ซ่อนสถานะหรือตัดการเชื่อมต่อชั่วคราวเมื่อไม่ได้รัน Roblox เพื่อประหยัดทรัพยากร": {
    "en": "Hides presence or disconnects when Roblox is closed to conserve resources",
    "ja": "リソース節約のため Roblox 停止時はステータスを非表示または切断",
    "zh": "未运行 Roblox 时隐藏状态或暂时断开连接以节省资源",
    "ko": "Roblox 미실행 시 리소스 절약을 위해 상태를 숨기거나 일시 연결 해제",
    "es": "Oculta el estado o desconecta cuando Roblox esté cerrado para ahorrar recursos"
  },
  "ซ่อนหน้าต่างไม่สำเร็จ": {
    "en": "Failed to hide window",
    "ja": "ウィンドウの非表示に失敗しました",
    "zh": "隐藏窗口失败",
    "ko": "창 숨기기 실패",
    "es": "Error al ocultar la ventana"
  },
  "ซ่อนหน้าต่างไม่สำเร็จ:": {
    "en": "Failed to hide windows:",
    "ja": "ウィンドウの非表示に失敗:",
    "zh": "隐藏窗口失败:",
    "ko": "창 숨기기 실패:",
    "es": "Error al ocultar ventanas:"
  },
  "ซ่อนหน้าต่าง Roblox ทั้งหมด": {
    "en": "Hide All Roblox Windows",
    "ja": "すべての Roblox ウィンドウを非表示",
    "zh": "隐藏所有 Roblox 窗口",
    "ko": "모든 Roblox 창 숨기기",
    "es": "Ocultar todas las ventanas de Roblox"
  },
  "ซ่อนหน้าต่าง Roblox ทั้งหมด ({0} จอ)": {
    "en": "Hide all Roblox windows ({0} windows)",
    "ja": "すべてのRobloxウィンドウを非表示 ({0} 画面)",
    "zh": "隐藏所有 Roblox 窗口 ({0} 个)",
    "ko": "모든 Roblox 창 숨기기 ({0}개 창)",
    "es": "Ocultar todas las ventanas de Roblox ({0} ventanas)"
  },
  "ซ่อนหน้าต่าง Roblox ทั้งหมดแล้ว": {
    "en": "All Roblox windows hidden",
    "ja": "すべての Roblox ウィンドウを非表示にしました",
    "zh": "已隐藏所有 Roblox 窗口",
    "ko": "모든 Roblox 창이 숨겨졌습니다",
    "es": "Todas las ventanas de Roblox ocultas"
  },
  "ซ่อน Roblox ทั้งหมด": {
    "en": "Hide All Roblox",
    "ja": "すべての Roblox を非表示",
    "zh": "隐藏全部 Roblox",
    "ko": "모든 Roblox 숨기기",
    "es": "Ocultar todo Roblox"
  },
  "ซ่อน Roblox อัตโนมัติ (Auto Hide Roblox)": {
    "en": "Auto Hide Roblox",
    "ja": "Roblox 自動非表示 (Auto Hide Roblox)",
    "zh": "自动隐藏 Roblox (Auto Hide Roblox)",
    "ko": "Roblox 자동 숨기기 (Auto Hide Roblox)",
    "es": "Ocultar Roblox automáticamente"
  },
  "ซิงค์ FastFlags ตรงกับโฟลเดอร์ ClientSettings ของ Roblox อัตโนมัติ": {
    "en": "Automatically sync FastFlags directly with Roblox ClientSettings folder",
    "ja": "Roblox の ClientSettings フォルダと FastFlags を自動同期",
    "zh": "自动将 FastFlags 同步到 Roblox 的 ClientSettings 文件夹",
    "ko": "Roblox의 ClientSettings 폴더와 FastFlags를 자동으로 동기화",
    "es": "Sincronizar FastFlags con la carpeta ClientSettings de Roblox"
  },
  "ซิงค์ FastFlags อัตโนมัติก่อนเปิดเกม (Auto-Sync on Launch)": {
    "en": "Auto-Sync FastFlags on Game Launch",
    "ja": "ゲーム起動時に FastFlags を自動同期 (Auto-Sync on Launch)",
    "zh": "游戏启动前自动同步 FastFlags (Auto-Sync on Launch)",
    "ko": "게임 실행 전 FastFlags 자동 동기화 (Auto-Sync on Launch)",
    "es": "Sincronizar FastFlags automáticamente al iniciar el juego"
  },
  "ซูมกล้องเข้าออกเพื่อความสมจริง": {
    "en": "Zooms camera in/out for realistic input simulation",
    "ja": "リアリティ向上のためカメラを拡大・縮小",
    "zh": "缩放镜头以模拟真实玩家操作",
    "ko": "자연스러운 조작 시뮬레이션을 위해 카메라 줌 인/아웃",
    "es": "Acerca y aleja la cámara para simular un jugador real"
  },
  "ซูมกล้อง (Camera Zoom In/Out)": {
    "en": "Camera Zoom In/Out",
    "ja": "カメラズーム (Camera Zoom In/Out)",
    "zh": "镜头缩放 (Camera Zoom In/Out)",
    "ko": "카메라 줌 인/아웃 (Camera Zoom In/Out)",
    "es": "Zoom de cámara"
  },
  "เซิร์ฟเวอร์คนน้อย": {
    "en": "Low Player Server",
    "ja": "少人数サーバー",
    "zh": "低人数服务器",
    "ko": "인원 적은 서버",
    "es": "Servidor con pocos jugadores"
  },
  "เซิร์ฟเวอร์คนน้อยที่สุด": {
    "en": "Lowest Player Count Server",
    "ja": "最小人数サーバー",
    "zh": "人数最少服务器",
    "ko": "최저 인원 서버",
    "es": "Servidor con menos jugadores"
  },
  "เซิร์ฟเวอร์เต็ม (Fill-to-Full)": {
    "en": "Fill-to-Full Server",
    "ja": "満員目標サーバー",
    "zh": "刚好塞满服务器",
    "ko": "인원 가득 찬 서버",
    "es": "Servidor lleno (Fill-to-Full)"
  },
  "เซิร์ฟเวอร์ที่คนเยอะ (เข้าแล้วเต็มพอดี)": {
    "en": "Fill-to-Full Server",
    "ja": "満員目標サーバー",
    "zh": "刚好塞满服务器",
    "ko": "인원 가득 찬 서버",
    "es": "Servidor lleno"
  },
  "เซิร์ฟเวอร์ปกติ": {
    "en": "Normal Server",
    "ja": "通常サーバー",
    "zh": "普通服务器",
    "ko": "일반 서버",
    "es": "Servidor normal"
  },
  "เซิร์ฟเวอร์ปกติ (Roblox เลือกให้)": {
    "en": "Normal Server (Roblox default)",
    "ja": "通常サーバー",
    "zh": "普通服务器",
    "ko": "일반 서버",
    "es": "Servidor normal"
  },
  "เซิร์ฟเวอร์ปิงน้อย": {
    "en": "Low Ping Server",
    "ja": "低 ping サーバー",
    "zh": "低延迟服务器",
    "ko": "낮은 핑 서버",
    "es": "Servidor con bajo ping"
  },
  "เซิร์ฟเวอร์ปิงน้อยที่สุด": {
    "en": "Lowest Ping Server",
    "ja": "最小pingサーバー",
    "zh": "延迟最低服务器",
    "ko": "최저 핑 서버",
    "es": "Servidor con menor ping"
  },
  "เซิร์ฟเวอร์ส่วนตัว:": {
    "en": "Private Server:",
    "ja": "プライベートサーバー:",
    "zh": "私人服务器:",
    "ko": "비공개 서버:",
    "es": "Servidor privado:"
  },
  "เซิร์ฟเวอร์ส่วนตัว": {
    "en": "Private Server",
    "ja": "プライベートサーバー",
    "zh": "私人服务器",
    "ko": "비공개 서버",
    "es": "Servidor privado"
  },
  "ดั้งเดิม (Legacy Safe Delay)": {
    "en": "Legacy Safe Delay",
    "ja": "レガシーセーフ待機 (Legacy Safe Delay)",
    "zh": "经典安全延迟 (Legacy Safe Delay)",
    "ko": "레거시 안전 지연 (Legacy Safe Delay)",
    "es": "Retardo seguro heredado"
  },
  "ดาวน์โหลด & ติดตั้ง Roblox เวอร์ชันต่างๆ": {
    "en": "Download & install various Roblox versions",
    "ja": "各 Roblox バージョンのダウンロードとインストール",
    "zh": "下载并安装各版本 Roblox",
    "ko": "다양한 Roblox 버전 다운로드 및 설치",
    "es": "Descargar e instalar versiones de Roblox"
  },
  "ดาวน์โหลดไปแล้ว": {
    "en": "Already downloaded",
    "ja": "ダウンロード済み",
    "zh": "已下载",
    "ko": "이미 다운로드됨",
    "es": "Ya descargado"
  },
  "ดาวน์โหลดไปแล้ว {0}%": {
    "en": "Downloaded {0}%",
    "ja": "ダウンロード完了 {0}%",
    "zh": "已下载 {0}%",
    "ko": "{0}% 다운로드됨",
    "es": "Descargado {0}%"
  },
  "ดาวน์โหลดไม่สำเร็จ": {
    "en": "Download failed",
    "ja": "ダウンロードに失敗しました",
    "zh": "下载失败",
    "ko": "다운로드 실패",
    "es": "Error en la descarga"
  },
  "ดาวน์โหลดและสั่งรันตัวติดตั้ง Roblox เรียบร้อยแล้ว": {
    "en": "Roblox installer downloaded and launched successfully",
    "ja": "Roblox インストーラーのダウンロードと実行が完了しました",
    "zh": "已成功下载并启动 Roblox 安装程序",
    "ko": "Roblox 설치 프로그램을 다운로드하여 실행했습니다",
    "es": "Instalador de Roblox descargado e iniciado con éxito"
  },
  "ดาวน์โหลดและสั่งรันตัวติดตั้ง Roblox เรียบร้อยแล้ว!": {
    "en": "Downloaded and launched Roblox installer successfully!",
    "ja": "Robloxインストーラーをダウンロードして起動しました！",
    "zh": "已成功下载并启动 Roblox 安装程序！",
    "ko": "Roblox 설치 프로그램을 다운로드하고 실행했습니다!",
    "es": "¡Instalador de Roblox descargado y ejecutado con éxito!"
  },
  "ดีที่สุด": {
    "en": "Best",
    "ja": "最適",
    "zh": "最佳",
    "ko": "최고",
    "es": "Mejor"
  },
  "ดึงหน้าต่างขึ้นบนสุดอย่างมีประสิทธิภาพ": {
    "en": "Bring window to top efficiently",
    "ja": "ウィンドウを最前面に効率的に復帰",
    "zh": "高效将窗口置于最前",
    "ko": "창을 효율적으로 최상단으로 가져오기",
    "es": "Traer ventana al frente de forma eficiente"
  },
  "ดึงหน้าต่าง Roblox ทั้งหมดที่รันอยู่กลับเข้าพิกัดตาม Grid ทันที": {
    "en": "Instantly snap all running Roblox windows back to Grid coordinates",
    "ja": "実行中の全 Roblox ウィンドウをグリッド座標に即座に再整列",
    "zh": "立即将所有运行中的 Roblox 窗口按网格坐标对齐归位",
    "ko": "실행 중인 모든 Roblox 창을 그리드 좌표에 맞춰 즉시 정렬",
    "es": "Ajusta al instante las ventanas de Roblox a la cuadrícula"
  },
  "ดู/แก้ไข": {
    "en": "View/Edit",
    "ja": "表示/編集",
    "zh": "查看/编辑",
    "ko": "보기/편집",
    "es": "Ver/Editar"
  },
  "ดู/แก้ไขโปรไฟล์ FastFlags": {
    "en": "View/Edit FastFlags Profile",
    "ja": "FastFlags プロファイルの確認/編集",
    "zh": "查看/编辑 FastFlags 配置文件",
    "ko": "FastFlags 프로필 보기/편집",
    "es": "Ver/Editar perfil de FastFlags"
  },
  "ดู/แก้ไข Flags": {
    "en": "View/Edit Flags",
    "ja": "Flags の確認/編集",
    "zh": "查看/编辑 Flags",
    "ko": "Flags 보기/편집",
    "es": "Ver/Editar Flags"
  },
  "ดูแบบตาราง": {
    "en": "Table View",
    "ja": "テーブル表示",
    "zh": "表格视图",
    "ko": "표 보기",
    "es": "Vista de tabla"
  },
  "ดูสคริปต์ยอดนิยม (Trending)": {
    "en": "View Trending Scripts",
    "ja": "トレンドスクリプトを表示 (Trending)",
    "zh": "查看热门脚本 (Trending)",
    "ko": "인기 스크립트 보기 (Trending)",
    "es": "Ver scripts en tendencia (Trending)"
  },
  "ดูอวตาร์ตัวละคร": {
    "en": "Inspect Avatar",
    "ja": "アバターを見る",
    "zh": "查看虚拟形象",
    "ko": "아바타 보기",
    "es": "Ver avatar"
  },
  "เดินหน้า-ถอยหลัง (W & S Move)": {
    "en": "W & S Move",
    "ja": "前後移動 (W & S Move)",
    "zh": "前后移动 (W & S Move)",
    "ko": "앞뒤 이동 (W & S Move)",
    "es": "Mover adelante y atrás (W y S)"
  },
  "เดินหน้าและถอยหลังทีละสเต็ป": {
    "en": "Steps forward and backward",
    "ja": "前後に1歩ずつ移動",
    "zh": "单步行进与后退",
    "ko": "앞뒤로 한 걸음씩 이동",
    "es": "Pasos adelante y atrás"
  },
  "เดือนที่แล้ว": {
    "en": "months ago",
    "ja": "ヶ月前",
    "zh": "个月前",
    "ko": "달 전",
    "es": "meses atrás"
  },
  "แดงเข้ม": {
    "en": "Crimson",
    "ja": "クリムゾン",
    "zh": "深红",
    "ko": "크림슨",
    "es": "Carmesí"
  },
  "ตกลง": {
    "en": "OK",
    "ja": "OK",
    "zh": "确定",
    "ko": "확인",
    "es": "Aceptar"
  },
  "ตรวจจับ": {
    "en": "Detect",
    "ja": "検出",
    "zh": "检测",
    "ko": "감지",
    "es": "Detectar"
  },
  "ตรวจจับจากหน้าต่างปัจจุบัน": {
    "en": "Detect from Current Window",
    "ja": "現在のウィンドウから検出",
    "zh": "从当前窗口检测",
    "ko": "현재 창에서 감지",
    "es": "Detectar desde ventana actual"
  },
  "ตรวจจับตำแหน่งจริงของหน้าต่างที่เปิดอยู่": {
    "en": "Detect actual position of active window",
    "ja": "開いているウィンドウの実際の位置を検出",
    "zh": "检测已打开窗口的实际屏幕坐标位置",
    "ko": "열려 있는 창의 실제 위치 감지",
    "es": "Detectar posición real de la ventana activa"
  },
  "')\" ตรวจจับตำแหน่งจริงของหน้าต่างที่เปิดอยู่": {
    "en": "Detect real window position",
    "ja": "開いているウィンドウの実際の位置を検出",
    "zh": "检测已打开窗口的实际屏幕坐标位置",
    "ko": "열려 있는 창의 실제 위치 감지",
    "es": "Detectar posición real de la ventana"
  },
  "ตรวจจับพิกัดหน้าต่างเรียบร้อยแล้ว": {
    "en": "Window coordinates detected successfully",
    "ja": "ウィンドウ座標を検出しました",
    "zh": "窗口坐标检测完成",
    "ko": "창 좌표를 성공적으로 감지했습니다",
    "es": "Coordenadas de ventana detectadas con éxito"
  },
  "ตรวจจับพิกัดหน้าต่างเรียบร้อยแล้ว!": {
    "en": "Window coordinates detected successfully!",
    "ja": "ウィンドウ座標を検出しました！",
    "zh": "窗口坐标检测完成！",
    "ko": "창 좌표가 성공적으로 감지되었습니다!",
    "es": "¡Coordenadas de ventana detectadas con éxito!"
  },
  "ตรวจจับและบันทึกพิกัดหน้าต่างเรียบร้อย": {
    "en": "Window coordinates detected and saved",
    "ja": "ウィンドウ座標を検出して保存しました",
    "zh": "已成功检测并保存窗口坐标",
    "ko": "창 좌표를 감지하여 저장했습니다",
    "es": "Coordenadas detectadas y guardadas"
  },
  "ตรวจจับและบันทึกพิกัดหน้าต่างเรียบร้อย!": {
    "en": "Window coordinates detected and saved!",
    "ja": "ウィンドウ座標を検出して保存しました！",
    "zh": "已检测并保存窗口坐标！",
    "ko": "창 좌표 감지 및 저장 완료!",
    "es": "¡Coordenadas de ventana detectadas y guardadas!"
  },
  "ตรวจจับและ Reconnect เดี๋ยวนี้": {
    "en": "Detect & Reconnect Now",
    "ja": "今すぐ検出して再接続",
    "zh": "立即检测并重新连接",
    "ko": "지금 감지 및 재연결",
    "es": "Detectar y reconectar ahora"
  },
  "ตรวจพบและ Reconnect": {
    "en": "Detected & Reconnected",
    "ja": "検出して再接続完了",
    "zh": "已检测并重连",
    "ko": "감지 및 재연결 완료",
    "es": "Detectado y reconectado"
  },
  "ตรวจพบและ Reconnect {0} หน้าต่างแล้ว": {
    "en": "Detected and reconnected {0} windows",
    "ja": "{0} 個のウィンドウを検出して再接続しました",
    "zh": "已检测并重新连接 {0} 个窗口",
    "ko": "{0}개 창 감지 및 재연결 완료",
    "es": "Se detectaron y reconectaron {0} ventanas"
  },
  "ตรวจสอบการเชื่อมต่อล้มเหลว": {
    "en": "Connection check failed",
    "ja": "接続確認に失敗しました",
    "zh": "连接检查失败",
    "ko": "연결 확인 실패",
    "es": "Error al comprobar conexión"
  },
  "ตรวจสอบการเชื่อมต่อล้มเหลว:": {
    "en": "Connection check failed:",
    "ja": "接続確認に失敗:",
    "zh": "检查连接失败:",
    "ko": "연결 확인 실패:",
    "es": "Error al verificar conexión:"
  },
  "ตรวจสอบการเชื่อมต่อแล้วกดรีเฟรช": {
    "en": "Check connection and click refresh",
    "ja": "接続を確認し再読み込みしてください",
    "zh": "请检查网络连接并点击刷新",
    "ko": "연결 상태를 확인하고 새로고침을 누르세요",
    "es": "Revisa la conexión y pulsa actualizar"
  },
  "ตรวจสอบสถานะการเชื่อมต่อแล้ว: ทุกหน้าต่างเชื่อมต่อปกติ": {
    "en": "Connection status checked: All windows connected normally",
    "ja": "接続状態確認完了: すべてのウィンドウが正常に接続されています",
    "zh": "连接状态检查完成: 所有窗口均连接正常",
    "ko": "연결 상태 확인 완료: 모든 창이 정상 연결되어 있습니다",
    "es": "Estado de conexión comprobado: todas las ventanas normales"
  },
  "ตรวจสอบ Discord...": {
    "en": "Checking Discord...",
    "ja": "Discord を確認中...",
    "zh": "正在检查 Discord...",
    "ko": "Discord 확인 중...",
    "es": "Comprobando Discord..."
  },
  "ตรวจสอบ Discord": {
    "en": "Check Discord",
    "ja": "Discord を確認",
    "zh": "检查 Discord",
    "ko": "Discord 확인",
    "es": "Comprobar Discord"
  },
  "ต้องการลบ FastFlags ที่เลือกไว้จำนวน": {
    "en": "Delete selected FastFlags count",
    "ja": "選択した FastFlags を削除",
    "zh": "删除所选 FastFlags 数量",
    "ko": "선택한 FastFlags 수 삭제",
    "es": "Eliminar FastFlags seleccionados"
  },
  "ต้องการลบ FastFlags ที่เลือกไว้จำนวน {0} รายการหรือไม่?": {
    "en": "Do you want to delete {0} selected FastFlags?",
    "ja": "選択した {0} 件のFastFlagsを削除しますか？",
    "zh": "是否删除选中的 {0} 个 FastFlags？",
    "ko": "선택한 {0}개의 FastFlags를 삭제하시겠습니까?",
    "es": "¿Eliminar los {0} FastFlags seleccionados?"
  },
  "ต้องเป็น Object": {
    "en": "Must be an Object",
    "ja": "オブジェクトである必要があります",
    "zh": "必须是一个对象 (Object)",
    "ko": "Object 형식이어야 합니다",
    "es": "Debe ser un objeto"
  },
  "ตั้งค่ากราฟิกเป็นอัตโนมัติแล้ว": {
    "en": "Graphics set to Auto",
    "ja": "グラフィックを自動に設定しました",
    "zh": "已将画质设为自动",
    "ko": "그래픽 설정이 자동으로 변경되었습니다",
    "es": "Gráficos configurados en Automático"
  },
  "ตั้งค่าขั้นสูง (Advanced)": {
    "en": "Advanced Settings",
    "ja": "高度な設定 (Advanced)",
    "zh": "高级设置 (Advanced)",
    "ko": "고급 설정 (Advanced)",
    "es": "Ajustes avanzados"
  },
  "ตั้งค่าความโปร่งใสไม่สำเร็จ": {
    "en": "Failed to apply window opacity",
    "ja": "透明度の設定に失敗しました",
    "zh": "设置窗口透明度失败",
    "ko": "창 투명도 설정 실패",
    "es": "Error al aplicar opacidad a la ventana"
  },
  "ตั้งค่าความโปร่งใสไม่สำเร็จ:": {
    "en": "Failed to set transparency:",
    "ja": "透明度の設定に失敗:",
    "zh": "设置透明度失败:",
    "ko": "투명도 설정 실패:",
    "es": "Error al configurar transparencia:"
  },
  "ตั้งค่า Discord RPC ล้มเหลว": {
    "en": "Failed to configure Discord RPC",
    "ja": "Discord RPC の設定に失敗しました",
    "zh": "配置 Discord RPC 失败",
    "ko": "Discord RPC 설정 실패",
    "es": "Error al configurar Discord RPC"
  },
  "ตั้งค่า Discord RPC ล้มเหลว:": {
    "en": "Failed to set Discord RPC:",
    "ja": "Discord RPCの設定に失敗:",
    "zh": "设置 Discord RPC 失败:",
    "ko": "Discord RPC 설정 실패:",
    "es": "Error al configurar Discord RPC:"
  },
  "ตั้งค่า flags ของ Roblox เช่น FPS cap บันทึกลง ClientAppSettings.json และมีผลเมื่อเปิดครั้งถัดไป": {
    "en": "Configure Roblox flags like FPS cap; saved to ClientAppSettings.json for next launch",
    "ja": "FPS制限などの Roblox Flags を設定。ClientAppSettings.json に保存され次回起動時に反映。",
    "zh": "配置 Roblox flags (例如 FPS 上限)，保存到 ClientAppSettings.json 并在下次启动时生效",
    "ko": "FPS 제한 등 Roblox flags 설정; ClientAppSettings.json에 저장되어 다음 실행 시 적용됩니다",
    "es": "Configura flags de Roblox como el límite de FPS; guardado en ClientAppSettings.json"
  },
  "ตั้งคีย์": {
    "en": "Set Key",
    "ja": "キーを設定",
    "zh": "设置密钥",
    "ko": "키 설정",
    "es": "Establecer clave"
  },
  "ตั้งคีย์เข้ารหัสเพื่อป้องกันบัญชีที่บันทึกไว้ ระบบจะถามคีย์ทุกครั้งที่เปิดแอป": {
    "en": "Set an encryption key to protect saved accounts. Key is required on each launch.",
    "ja": "暗号化キーを設定して保存アカウントを保護。起動ごとに入力が必要です。",
    "zh": "设置加密密钥以保护保存的账户。每次启动软件时都需要输入该密钥。",
    "ko": "저장된 계정을 보호하기 위해 암호화 키를 설정하세요. 앱 실행 시마다 키를 묻습니다.",
    "es": "Establece una clave para proteger las cuentas. Se pedirá al abrir la app."
  },
  "ตั้งคีย์ไว้แล้ว พิมพ์เพื่อเปลี่ยน": {
    "en": "Key is set. Type to change.",
    "ja": "設定済み。変更するには入力してください。",
    "zh": "密钥已设置。键入以更改。",
    "ko": "키가 설정되어 있습니다. 변경하려면 입력하세요.",
    "es": "Clave configurada. Escribe para cambiarla."
  },
  "ตั้งชื่อโปรไฟล์ เช่น MyFarmProfile หรือ HighFPS": {
    "en": "Enter profile name, e.g. MyFarmProfile or HighFPS",
    "ja": "プロファイル名を入力 (例: MyFarmProfile または HighFPS)",
    "zh": "输入配置文件名称，例如 MyFarmProfile 或 HighFPS",
    "ko": "프로필 이름 입력 (예: MyFarmProfile 또는 HighFPS)",
    "es": "Introduce un nombre de perfil, ej. MyFarmProfile o HighFPS"
  },
  "ตั้งรหัสผ่าน / เปลี่ยนรหัสผ่าน": {
    "en": "Set / Change Password",
    "ja": "パスワードの設定 / 変更",
    "zh": "设置 / 修改密码",
    "ko": "비밀번호 설정 / 변경",
    "es": "Establecer / Cambiar contraseña"
  },
  "ตั้งรหัสผ่านใหม่ เปลี่ยนรหัสผ่าน หรือยกเลิกรหัสผ่านก่อนเข้าใช้งานโปรแกรม": {
    "en": "Set, change, or remove the startup security password",
    "ja": "アプリ起動パスワードの新規設定、変更、または解除",
    "zh": "设置新密码、更改密码或取消程序启动密码",
    "ko": "앱 실행 전 보안 비밀번호를 설정, 변경 또는 제거하세요",
    "es": "Establece, cambia o quita la contraseña de inicio"
  },
  "ตัวกรอง": {
    "en": "Filters",
    "ja": "フィルター",
    "zh": "过滤器",
    "ko": "필터",
    "es": "Filtros"
  },
  "ตัวสร้าง": {
    "en": "Generator",
    "ja": "ジェネレーター",
    "zh": "生成器",
    "ko": "생성기",
    "es": "Generador"
  },
  "ตัวสร้างคุกกี้": {
    "en": "Cookie Generator",
    "ja": "クッキージェネレーター",
    "zh": "Cookie 生成器",
    "ko": "쿠키 생성기",
    "es": "Generador de cookies"
  },
  "ตัวอย่างการแสดงผลบน Discord (Live Activity Preview)": {
    "en": "Live Activity Preview on Discord",
    "ja": "Discord 上の表示プレビュー (Live Activity Preview)",
    "zh": "Discord 活动状态实时预览",
    "ko": "Discord 실시간 활동 미리보기",
    "es": "Vista previa de actividad en vivo en Discord"
  },
  "ตัวอย่างหน้าจอจำลอง (Screen Layout Preview)": {
    "en": "Screen Layout Preview",
    "ja": "画面配置プレビュー (Screen Layout Preview)",
    "zh": "屏幕布局预览 (Screen Layout Preview)",
    "ko": "화면 레이아웃 미리보기 (Screen Layout Preview)",
    "es": "Vista previa de diseño de pantalla"
  },
  "ตามแมพกำหนด (Default)": {
    "en": "Map Default",
    "ja": "マップデフォルト",
    "zh": "地图默认",
    "ko": "맵 기본값",
    "es": "Predeterminado del mapa"
  },
  "ตาราง Flags": {
    "en": "Flags Table",
    "ja": "Flags テーブル",
    "zh": "Flags 表格",
    "ko": "Flags 테이블",
    "es": "Tabla de Flags"
  },
  "ติดตั้งเรียบร้อยแล้ว": {
    "en": "Installed successfully",
    "ja": "インストール完了",
    "zh": "安装完成",
    "ko": "설치 완료",
    "es": "Instalado con éxito"
  },
  "ติดตั้งเรียบร้อยแล้ว!": {
    "en": "Installation complete!",
    "ja": "インストールが完了しました！",
    "zh": "安装完成！",
    "ko": "설치가 완료되었습니다!",
    "es": "¡Instalación completa!"
  },
  "ติดตั้งแล้ว (Voidstrap Ready)": {
    "en": "Installed (Voidstrap Ready)",
    "ja": "インストール済み (Voidstrap Ready)",
    "zh": "已安装 (Voidstrap 就绪)",
    "ko": "설치됨 (Voidstrap 준비 완료)",
    "es": "Instalado (Voidstrap listo)"
  },
  "ติดตั้งเวอร์ชันด้วยรหัส Version Hash (Custom Build)": {
    "en": "Install Version by Hash (Custom Build)",
    "ja": "Version Hash でバージョンをインストール (Custom Build)",
    "zh": "通过 Version Hash 代码安装特定版本 (Custom Build)",
    "ko": "Version Hash 코드로 버전 설치 (Custom Build)",
    "es": "Instalar versión por Hash (Custom Build)"
  },
  "ติดตั้งเวอร์ชันนี้": {
    "en": "Install this version",
    "ja": "このバージョンをインストール",
    "zh": "安装此版本",
    "ko": "이 버전 설치",
    "es": "Instalar esta versión"
  },
  "ติดตั้ง Bloxstrap แล้ว": {
    "en": "Bloxstrap Installed",
    "ja": "Bloxstrap インストール済み",
    "zh": "Bloxstrap 已安装",
    "ko": "Bloxstrap 설치됨",
    "es": "Bloxstrap instalado"
  },
  "ติดตั้ง Hash นี้": {
    "en": "Install This Hash",
    "ja": "この Hash をインストール",
    "zh": "安装此 Hash",
    "ko": "이 Hash 설치",
    "es": "Instalar este Hash"
  },
  "ติดตั้ง Mods ไปยังตัวเกม": {
    "en": "Install Mods to Game Client",
    "ja": "ゲームクライアントに Mod をインストール",
    "zh": "安装 Mods 至游戏客户端",
    "ko": "게임 클라이언트에 모드 설치",
    "es": "Instalar Mods en el juego"
  },
  "ติดตั้ง Mods ไม่สำเร็จ": {
    "en": "Failed to install Mods",
    "ja": "Mod のインストールに失敗しました",
    "zh": "安装 Mods 失败",
    "ko": "모드 설치 실패",
    "es": "Error al instalar Mods"
  },
  "ติดตั้ง Mods ไม่สำเร็จ:": {
    "en": "Failed to install mods:",
    "ja": "Modのインストールに失敗:",
    "zh": "安装 Mod 失败:",
    "ko": "모드 설치 실패:",
    "es": "Error al instalar mods:"
  },
  "ติดตั้ง Mods เรียบร้อยแล้ว (คัดลอก)": {
    "en": "Mods installed successfully (copied)",
    "ja": "Mod を正常にインストールしました (コピー完了)",
    "zh": "Mods 已成功安装 (已复制)",
    "ko": "모드가 성공적으로 설치되었습니다 (복사됨)",
    "es": "Mods instalados con éxito (copiados)"
  },
  "ติดตั้ง Mods เรียบร้อยแล้ว (คัดลอก": {
    "en": "Mods installed successfully (copied",
    "ja": "Mod を正常にインストールしました (コピー完了",
    "zh": "Mods 已成功安装 (已复制",
    "ko": "모드가 성공적으로 설치되었습니다 (복사됨",
    "es": "Mods instalados con éxito (copiados"
  },
  "ติดตั้ง Mods เรียบร้อยแล้ว (คัดลอก {0} ไฟล์)": {
    "en": "Mods installed successfully (copied {0} files)",
    "ja": "Modをインストールしました ({0} ファイルをコピー)",
    "zh": "Mod 安装完成 (已复制 {0} 个文件)",
    "ko": "모드 설치 완료 ({0}개 파일 복사됨)",
    "es": "Mods instalados con éxito (copiados {0} archivos)"
  },
  "ติดตั้ง Mods ล้มเหลว": {
    "en": "Mod installation failed",
    "ja": "Mod のインストールに失敗しました",
    "zh": "Mod 安装失败",
    "ko": "모드 설치 실패",
    "es": "Error en la instalación de Mods"
  },
  "ติดตั้ง Mods ล้มเหลว:": {
    "en": "Failed to install mods:",
    "ja": "Modのインストールに失敗:",
    "zh": "安装 Mod 失败:",
    "ko": "모드 설치 실패:",
    "es": "Error al instalar mods:"
  },
  "ถอดรหัสไม่สำเร็จ": {
    "en": "Decryption failed",
    "ja": "復号に失敗しました",
    "zh": "解密失败",
    "ko": "복호화 실패",
    "es": "Error al descifrar"
  },
  "ท": {
    "en": "General",
    "ja": "一般",
    "zh": "常规",
    "ko": "일반",
    "es": "General"
  },
  "ทดสอบไม่สำเร็จ": {
    "en": "Test failed",
    "ja": "テストに失敗しました",
    "zh": "测试失败",
    "ko": "테스트 실패",
    "es": "Prueba fallida"
  },
  "ทดสอบไม่สำเร็จ:": {
    "en": "Test failed:",
    "ja": "テストに失敗:",
    "zh": "测试失败:",
    "ko": "테스트 실패:",
    "es": "Error en la prueba:"
  },
  "ทดสอบและส่งสถานะทันที": {
    "en": "Test & broadcast status now",
    "ja": "ステータスを即座にテスト送信",
    "zh": "立即测试并广播状态",
    "ko": "즉시 상태 테스트 및 전송",
    "es": "Probar y enviar estado ahora"
  },
  "ทดสอบ Action Anti-AFK: ไม่พบหน้าต่าง Roblox ที่เปิดอยู่": {
    "en": "Anti-AFK Action Test: No active Roblox windows found",
    "ja": "Anti-AFK アクションテスト: 起動中の Roblox ウィンドウがありません",
    "zh": "防挂机测试: 未找到打开的 Roblox 窗口",
    "ko": "Anti-AFK 동작 테스트: 실행 중인 Roblox 창을 찾을 수 없습니다",
    "es": "Prueba Anti-AFK: no se encontraron ventanas de Roblox abiertas"
  },
  "ทดสอบ Action Anti-AFK สำเร็จแล้ว": {
    "en": "Anti-AFK Action tested successfully",
    "ja": "Anti-AFK アクションテストに成功しました",
    "zh": "防挂机动作测试成功",
    "ko": "Anti-AFK 동작 테스트 성공",
    "es": "Prueba de acción Anti-AFK realizada con éxito"
  },
  "ทดสอบ Anti-AFK": {
    "en": "Test Anti-AFK",
    "ja": "Anti-AFK テスト",
    "zh": "测试防挂机",
    "ko": "Anti-AFK 테스트",
    "es": "Probar Anti-AFK"
  },
  "ทดสอบ Anti-AFK Action": {
    "en": "Test Anti-AFK Action",
    "ja": "Anti-AFK アクションをテスト",
    "zh": "测试防挂机动作",
    "ko": "Anti-AFK 동작 테스트",
    "es": "Probar acción Anti-AFK"
  },
  "ทดสอบ Discord Webhook": {
    "en": "Test Discord Webhook",
    "ja": "Discord Webhook をテスト",
    "zh": "测试 Discord Webhook",
    "ko": "Discord Webhook 테스트",
    "es": "Probar Discord Webhook"
  },
  "ทดสอบ Webhook": {
    "en": "Test Webhook",
    "ja": "Webhook をテスト",
    "zh": "测试 Webhook",
    "ko": "Webhook 테스트",
    "es": "Probar Webhook"
  },
  "ท้องฟ้าสีเทาเรียบง่าย (Gray Sky - Reduce GPU Load)": {
    "en": "Gray Sky (Reduce GPU Load)",
    "ja": "グレースカイ (GPU負荷軽減)",
    "zh": "纯灰天空 (降低 GPU 负载)",
    "ko": "그레이 스카이 (GPU 부하 절감)",
    "es": "Cielo gris (reduce carga de GPU)"
  },
  "ทั่วไป": {
    "en": "General",
    "ja": "一般",
    "zh": "常规",
    "ko": "일반",
    "es": "General"
  },
  "ท่าทาง Anti-AFK (Anti-AFK Action)": {
    "en": "Anti-AFK Action Type",
    "ja": "Anti-AFK アクション形式 (Anti-AFK Action)",
    "zh": "防挂机动作模式 (Anti-AFK Action)",
    "ko": "Anti-AFK 동작 유형 (Anti-AFK Action)",
    "es": "Tipo de acción Anti-AFK"
  },
  "ทำรายได้สูงสุด": {
    "en": "Top Grossing",
    "ja": "売上トップ",
    "zh": "畅销排行",
    "ko": "최고 매출",
    "es": "Más recaudación"
  },
  "ทำให้หน้าจอเบื้องหลังยังคงคมชัดเมื่อกดเปิดเมนู Escape": {
    "en": "Keep background sharp and unblurred when opening Escape menu",
    "ja": "Escape メニュー表示時も背景画面をぼかさず鮮明に保つ",
    "zh": "按 Esc 打开菜单时使背景保持清晰不模糊",
    "ko": "Esc 메뉴를 열었을 때 배경을 흐리게 하지 않고 선명하게 유지합니다",
    "es": "Mantiene nítido el fondo al pulsar el menú Escape"
  },
  "ที่กำลังรัน": {
    "en": "Currently running",
    "ja": "実行中:",
    "zh": "正在运行:",
    "ko": "실행 중:",
    "es": "En ejecución"
  },
  "ที่เก็บข้อมูล": {
    "en": "Storage",
    "ja": "保存先",
    "zh": "数据存储",
    "ko": "저장소",
    "es": "Almacenamiento"
  },
  "ทุกบัญชี": {
    "en": "All accounts",
    "ja": "すべてのアカウント",
    "zh": "所有账户",
    "ko": "모든 계정",
    "es": "Todas"
  },
  "เทคโนโลยีแสง (Lighting Technology)": {
    "en": "Lighting Technology",
    "ja": "ライティングテクノロジー (Lighting Technology)",
    "zh": "光照渲染技术 (Lighting Technology)",
    "ko": "조명 기술 (Lighting Technology)",
    "es": "Tecnología de iluminación"
  },
  "เทมเพลตโปรไฟล์สำเร็จรูป (Preset Profiles)": {
    "en": "Preset Profiles",
    "ja": "プリセットプロファイル (Preset Profiles)",
    "zh": "预设配置文件 (Preset Profiles)",
    "ko": "프리셋 프로필 (Preset Profiles)",
    "es": "Perfiles predefinidos"
  },
  "เทมา": {
    "en": "Themes",
    "ja": "テーマ",
    "zh": "主题",
    "ko": "테마",
    "es": "Temas"
  },
  "เที่ยงคืน": {
    "en": "Midnight",
    "ja": "ミッドナイト",
    "zh": "午夜蓝",
    "ko": "미드나잇 블루",
    "es": "Medianoche"
  },
  "แท็ก @everyone เมื่อเกิด Error": {
    "en": "Tag @everyone on Error",
    "ja": "エラー時に @everyone をメンション",
    "zh": "出错时提及 @everyone",
    "ko": "오류 발생 시 @everyone 멘션",
    "es": "Mencionar a @everyone en caso de error"
  },
  "แทนที่เสียงตายดั้งเดิมของ Roblox ด้วยเสียงที่เลือก": {
    "en": "Replace original Roblox death sound with selected audio",
    "ja": "Roblox のデフォルト死亡音を選択したサウンドに置き換え",
    "zh": "将 Roblox 原版死亡音效替换为所选声音",
    "ko": "Roblox 기본 사망 효과음을 선택한 오디오로 교체합니다",
    "es": "Reemplaza el sonido de muerte original de Roblox por el seleccionado"
  },
  "ไทย": {
    "en": "Thai",
    "ja": "タイ語",
    "zh": "泰语",
    "ko": "태국어",
    "es": "Tailandés"
  },
  "ธีม": {
    "en": "Themes",
    "ja": "テーマ",
    "zh": "主题",
    "ko": "テーマ",
    "es": "Temas"
  },
  "นับเวลาตั้งแต่เปิดเกมล่าสุด": {
    "en": "Elapsed time since last game launch",
    "ja": "最後のゲーム起動からの経過時間",
    "zh": "自最近启动游戏以来的经过时间",
    "ko": "마지막 게임 실행 이후 경과 시간",
    "es": "Tiempo transcurrido desde el último inicio del juego"
  },
  "นับเวลาตั้งแต่เปิดแอป": {
    "en": "Elapsed since app start",
    "ja": "アプリ起動時からの経過時間",
    "zh": "自软件启动以来计时",
    "ko": "앱 실행 시점부터 시간 측정",
    "es": "Tiempo transcurrido desde el inicio de la app"
  },
  "นาทีที่แล้ว": {
    "en": "minutes ago",
    "ja": "分前",
    "zh": "分钟前",
    "ko": "분 전",
    "es": "minutos atrás"
  },
  "นำเข้าคุกกี้ที่สร้างเข้าในโปรแกรม": {
    "en": "Import generated cookie into manager",
    "ja": "生成されたクッキーをマネージャーにインポートする",
    "zh": "将生成的 Cookie 导入管理器",
    "ko": "생성된 쿠키를 관리자에 가져오기",
    "es": "Importar cookie generada al gestor"
  },
  "นำเข้าพรีเซ็ต: สายเกมเมอร์ (Gaming)": {
    "en": "Import Preset: Gaming",
    "ja": "プリセットをインポート: ゲーマー向け (Gaming)",
    "zh": "导入预设: 游戏玩家 (Gaming)",
    "ko": "프리셋 가져오기: 게이머 (Gaming)",
    "es": "Importar preset: Gaming"
  },
  "นำเข้าพรีเซ็ต: สายฟาร์ม (Farming)": {
    "en": "Import Preset: Farming",
    "ja": "プリセットをインポート: 周回・放置 (Farming)",
    "zh": "导入预设: 挂机农场 (Farming)",
    "ko": "프리셋 가져오기: 파밍 (Farming)",
    "es": "Importar preset: Farming"
  },
  "นำเข้าพรีเซ็ต: สายมินิมอล (Minimal)": {
    "en": "Import Preset: Minimal",
    "ja": "プリセットをインポート: ミニマル (Minimal)",
    "zh": "导入预设: 极简流畅 (Minimal)",
    "ko": "프리셋 가져오기: 미니멀 (Minimal)",
    "es": "Importar preset: Minimal"
  },
  "นำเข้าไฟล์ล้มเหลว": {
    "en": "File import failed",
    "ja": "ファイルのインポートに失敗しました",
    "zh": "文件导入失败",
    "ko": "파일 가져오기 실패",
    "es": "Error al importar archivo"
  },
  "นำเข้าไฟล์ล้มเหลว:": {
    "en": "Failed to import file:",
    "ja": "ファイルのインポートに失敗:",
    "zh": "导入文件失败:",
    "ko": "파일 가져오기 실패:",
    "es": "Error al importar archivo:"
  },
  "นำเข้าล้มเหลวทุกบัญชี": {
    "en": "All accounts failed to import",
    "ja": "すべてのアカウントのインポートに失敗しました",
    "zh": "所有账户导入均失败",
    "ko": "모든 계정 가져오기 실패",
    "es": "Error al importar todas las cuentas"
  },
  "นำเข้าล้มเหลวทุกบัญชี ({0} บัญชี)": {
    "en": "All accounts failed to import ({0} accounts)",
    "ja": "すべてのアカウントのインポートに失敗しました ({0} アカウント)",
    "zh": "所有账户导入均失败 ({0} 个账户)",
    "ko": "모든 계정 가져오기 실패 ({0}개 계정)",
    "es": "Error al importar todas las cuentas ({0} cuentas)"
  },
  "นำเข้า/ส่งออก และเป้าหมายการซิงค์ (Backup & Targets)": {
    "en": "Backup & Targets",
    "ja": "バックアップと同期先 (Backup & Targets)",
    "zh": "备份与同步目标 (Backup & Targets)",
    "ko": "백업 및 동기화 대상 (Backup & Targets)",
    "es": "Copia de seguridad y destinos"
  },
  "นำเข้าสำเร็จ": {
    "en": "Imported successfully",
    "ja": "インポート完了",
    "zh": "导入成功",
    "ko": "가져오기 완료",
    "es": "Importado con éxito"
  },
  "นำเข้าสำเร็จ {0} บัญชี": {
    "en": "Imported {0} accounts successfully",
    "ja": "{0} アカウントのインポートに成功",
    "zh": "成功导入 {0} 个账户",
    "ko": "{0}개 계정 가져오기 성공",
    "es": "Se importaron {0} cuentas con éxito"
  },
  "นำเข้าสำเร็จ {0} บัญชี (ล้มเหลว {1} บัญชี)": {
    "en": "Successfully imported {0} accounts ({1} failed)",
    "ja": "{0} 個のアカウントをインポートしました ({1} 個失敗)",
    "zh": "成功导入 {0} 个账户 ({1} 个失败)",
    "ko": "{0}개 계정 가져오기 성공 ({1}개 실패)",
    "es": "Se importaron {0} cuentas con éxito ({1} fallidas)"
  },
  "นำเข้า FastFlags จาก": {
    "en": "Import FastFlags from",
    "ja": "FastFlags をインポート:",
    "zh": "从以下位置导入 FastFlags:",
    "ko": "다음에서 FastFlags 가져오기:",
    "es": "Importar FastFlags desde"
  },
  "นำเข้า FastFlags จาก {0} เรียบร้อยแล้ว": {
    "en": "Imported FastFlags from {0} successfully",
    "ja": "{0} からFastFlagsをインポートしました",
    "zh": "已成功从 {0} 导入 FastFlags",
    "ko": "{0}에서 FastFlags를 가져왔습니다",
    "es": "FastFlags importados de {0} con éxito"
  },
  "นำเข้า JSON": {
    "en": "Import JSON",
    "ja": "JSON をインポート",
    "zh": "导入 JSON",
    "ko": "JSON 가져오기",
    "es": "Importar JSON"
  },
  "เน้นความเร็ว ตอบสนองฉับไว ปลดล็อคเฟรมเรต": {
    "en": "Speed and responsiveness focus, unlocked framerate",
    "ja": "応答速度重視、フレームレート制限解除",
    "zh": "侧重响应速度与低延迟，解锁最高帧率",
    "ko": "빠른 반응속도 및 프레임 제한 해제 중심",
    "es": "Enfocado en velocidad y respuesta rápida, fotogramas desbloqueados"
  },
  "แน่ใจหรือไม่?": {
    "en": "Are you sure?",
    "ja": "本当によろしいですか？",
    "zh": "您确定吗？",
    "ko": "정말 진행하시겠습니까?",
    "es": "¿Estás seguro?"
  },
  "แน่ใจหรือไม่": {
    "en": "Are you sure",
    "ja": "本当によろしいですか",
    "zh": "您确定吗",
    "ko": "정말 진행하시겠습니까",
    "es": "Estás seguro"
  },
  "แนะนำ": {
    "en": "Recommended",
    "ja": "おすすめ",
    "zh": "推荐",
    "ko": "추천",
    "es": "Recomendado"
  },
  "แนะนำบอท": {
    "en": "Bot Recommendation",
    "ja": "ボットの推奨",
    "zh": "挂机推荐",
    "ko": "봇 추천",
    "es": "Recomendación de bot"
  },
  "บล็อกการส่งข้อมูล Log/Telemetry ของ Roblox ไปยังเซิร์ฟเวอร์ภายนอก": {
    "en": "Block Roblox telemetry and logs from uploading to external servers",
    "ja": "Roblox のログ・テレメトリの外部サーバー送信をブロック",
    "zh": "阻止 Roblox 日志与遥测数据上传至外部服务器",
    "ko": "Roblox 로그 및 텔레메트리 데이터의 외부 전송을 차단합니다",
    "es": "Bloquea el envío de telemetría y logs de Roblox a servidores externos"
  },
  "บล็อกการส่ง Crash Dump & Analytics": {
    "en": "Block Crash Dumps & Analytics",
    "ja": "クラッシュダンプと解析データの送信を遮断",
    "zh": "阻止发送崩溃转储与遥测分析",
    "ko": "크래시 덤프 및 분석 데이터 전송 차단",
    "es": "Bloquear volcados de memoria y analíticas"
  },
  "บล็อกการส่ง Error Log และสถิติการเล่นไปยังเซิร์ฟเวอร์ภายนอก": {
    "en": "Block sending error logs and gameplay stats to external servers",
    "ja": "エラーログおよびプレイ統計の外部送信をブロック",
    "zh": "阻止向外部服务器发送错误日志及游戏统计数据",
    "ko": "오류 로그 및 플레이 통계의 외부 전송 차단",
    "es": "Bloquea el envío de registros de error y estadísticas de juego"
  },
  "บล็อกซีเฟอร์แบบดั้งเดิม": {
    "en": "Legacy Block Cipher",
    "ja": "レガシーブロック暗号",
    "zh": "经典分组加密",
    "ko": "레거시 블록 암호",
    "es": "Cifrado de bloque heredado"
  },
  "บล็อก Telemetry V2 Endpoint": {
    "en": "Block Telemetry V2 Endpoint",
    "ja": "Telemetry V2 エンドポイントをブロック",
    "zh": "阻止 Telemetry V2 接口",
    "ko": "Telemetry V2 엔드포인트 차단",
    "es": "Bloquear Telemetry V2 Endpoint"
  },
  "บังคับคุณภาพคงที่ (1 = ต่ำสุด, 21 = สูงสุด) มีผลกับทุกอินสแตนซ์เมื่อเปิดครั้งถัดไป": {
    "en": "Forces constant quality (1 = min, 21 = max). Takes effect next launch.",
    "ja": "描画品質を固定 (1 = 最小, 21 = 最大)。次回起動時に反映。",
    "zh": "强制固定质量（1 = 最低，21 = 最高）。下次启动时生效。",
    "ko": "고정 그래픽 품질을 적용 (1 = 최저, 21 = 최고). 다음 실행 시 적용.",
    "es": "Calidad constante (1 = mín, 21 = máx). Se aplica al reiniciar."
  },
  "บังคับเปิดระบบแสงเงาขั้นสูงระดับสตูดิโอ ภาพและแสงเงาสวยงามสมจริง": {
    "en": "Force studio-grade Future lighting with realistic reflections and dynamic shadows",
    "ja": "スタジオ級の Future ライティングを強制し、リアルな反射と影を実現",
    "zh": "强制启用工作室级 Future 光影，展现逼真画面与动态阴影",
    "ko": "스튜디오급 Future 조명을 강제 활성화하여 사실적인 반사 및 그림자 구현",
    "es": "Fuerza iluminación Future con reflejos realistas y sombras dinámicas"
  },
  "บังคับระดับ Antialiasing MSAA 4x": {
    "en": "Force Antialiasing MSAA 4x",
    "ja": "アンチエイリアス MSAA 4x を強制",
    "zh": "强制开启 MSAA 4x 抗锯齿",
    "ko": "MSAA 4x 안티앨리어싱 강제 적용",
    "es": "Forzar suavizado MSAA 4x"
  },
  "บังคับ Graphic Backend API ของ Roblox": {
    "en": "Force Roblox Graphic Backend API",
    "ja": "Roblox のグラフィックバックエンド API を強制",
    "zh": "强制指定 Roblox 图形渲染后端 API",
    "ko": "Roblox 그래픽 렌더링 백엔드 API 강제 지정",
    "es": "Forzar Graphic Backend API de Roblox"
  },
  "บัญชี": {
    "en": "Accounts",
    "ja": "アカウント",
    "zh": "账户",
    "ko": "계정",
    "es": "Cuentas"
  },
  "บัญชี)": {
    "en": "Accounts)",
    "ja": "アカウント)",
    "zh": "账户)",
    "ko": "계정)",
    "es": "Cuentas)"
  },
  "บัญชี {0} ปิดการทำงานหรือหลุดการเชื่อมต่อ": {
    "en": "Account {0} closed or disconnected",
    "ja": "アカウント {0} が終了または切断されました",
    "zh": "账户 {0} 已关闭或断开连接",
    "ko": "계정 {0}이(가) 종료되었거나 연결이 끊어졌습니다",
    "es": "La cuenta {0} se ha cerrado o desconectado"
  },
  "บัญชีใช่ไหม? การกระทำนี้ย้อนกลับไม่ได้": {
    "en": "account? This action cannot be undone.",
    "ja": "アカウントですか？この操作は元に戻せません。",
    "zh": "账户吗？此操作无法撤销。",
    "ko": "계정입니까? 이 작업은 취소할 수 없습니다.",
    "es": "¿esta cuenta? Esta acción no se puede deshacer."
  },
  "บัญชีที่บันทึก": {
    "en": "Saved Accounts",
    "ja": "保存されたアカウント",
    "zh": "已保存账户",
    "ko": "저장된 계정",
    "es": "Cuentas guardadas"
  },
  "บัญชีที่บันทึกไว้": {
    "en": "saved accounts",
    "ja": "個のアカウントが保存されています",
    "zh": "个已保存账户",
    "ko": "개의 저장된 계정",
    "es": "cuentas guardadas"
  },
  "บัญชี, รันในโหมดจับคู่ปกติ": {
    "en": "accounts, running in normal matchmaking",
    "ja": "アカウント。通常マッチングで実行中",
    "zh": "个账户，正在普通匹配模式下运行",
    "ko": "개 계정, 일반 매칭 모드로 실행 중",
    "es": "cuentas, ejecutando en emparejamiento normal"
  },
  "บัญชี (ล้มเหลว)": {
    "en": "Accounts (Failed)",
    "ja": "アカウント (失敗)",
    "zh": "账户 (失败)",
    "ko": "계정 (실패)",
    "es": "Cuentas (Fallidas)"
  },
  "บัญชี (ล้มเหลว": {
    "en": "Accounts (Failed",
    "ja": "アカウント (失敗",
    "zh": "账户 (失败",
    "ko": "계정 (실패",
    "es": "Cuentas (Fallidas"
  },
  "บันทึก": {
    "en": "Save",
    "ja": "保存",
    "zh": "保存",
    "ko": "저장",
    "es": "Guardar"
  },
  "บันทึกกลุ่ม": {
    "en": "Save Package",
    "ja": "グループを保存",
    "zh": "保存群组",
    "ko": "그룹 저장",
    "es": "Guardar grupo"
  },
  "บันทึกกลุ่มแล้ว": {
    "en": "Package saved",
    "ja": "グループを保存しました",
    "zh": "群组已保存",
    "ko": "그룹이 저장되었습니다",
    "es": "Grupo guardado"
  },
  "บันทึกการแก้ไข": {
    "en": "Save Changes",
    "ja": "変更を保存",
    "zh": "保存修改",
    "ko": "변경사항 저장",
    "es": "Guardar cambios"
  },
  "บันทึกการตั้งค่าทั้งหมด": {
    "en": "Save All Settings",
    "ja": "すべての設定を保存",
    "zh": "保存所有设置",
    "ko": "모든 설정 저장",
    "es": "Guardar todos los ajustes"
  },
  "บันทึกการตั้งค่าไม่สำเร็จ": {
    "en": "Failed to save settings",
    "ja": "設定の保存に失敗しました",
    "zh": "保存设置失败",
    "ko": "설정 저장 실패",
    "es": "Error al guardar la configuración"
  },
  "บันทึกการตั้งค่าไม่สำเร็จ:": {
    "en": "Failed to save settings:",
    "ja": "設定の保存に失敗:",
    "zh": "保存设置失败:",
    "ko": "설정 저장 실패:",
    "es": "Error al guardar configuración:"
  },
  "บันทึกการตั้งค่า Discord RPC เรียบร้อยแล้ว": {
    "en": "Discord RPC settings saved successfully",
    "ja": "Discord RPC 設定を保存しました",
    "zh": "Discord RPC 设置已保存",
    "ko": "Discord RPC 설정이 저장되었습니다",
    "es": "Ajustes de Discord RPC guardados con éxito"
  },
  "บันทึกการตั้งค่า FastFlags ล้มเหลว": {
    "en": "Failed to save FastFlags settings",
    "ja": "FastFlags 設定の保存に失敗しました",
    "zh": "保存 FastFlags 设置失败",
    "ko": "FastFlags 설정 저장 실패",
    "es": "Error al guardar ajustes de FastFlags"
  },
  "บันทึกค่าที่ปรับแต่งไว้เพื่อเรียกใช้ในภายหลังหรือสลับชุดตั้งค่าได้อย่างรวดเร็ว": {
    "en": "Save configurations for later use or quick switching",
    "ja": "カスタマイズした設定を保存して後で素早く切り替え",
    "zh": "保存自定义配置以便稍后使用或快速切换预设",
    "ko": "사용자 설정 구성을 저장하여 나중에 사용하거나 빠르게 전환하세요",
    "es": "Guarda configuraciones personalizadas para cambiar rápidamente"
  },
  "บันทึกชุด FastFlags ปัจจุบันเป็นโปรไฟล์ใหม่": {
    "en": "Save current FastFlags configuration as a new profile",
    "ja": "現在の FastFlags 設定を新規プロファイルとして保存",
    "zh": "将当前 FastFlags 配置保存为新配置文件",
    "ko": "현재 FastFlags 구성을 새 프로필로 저장",
    "es": "Guardar configuración actual de FastFlags como nuevo perfil"
  },
  "บันทึกเซสชัน กด Ctrl+F เพื่อค้นหา": {
    "en": "Session logs. Press Ctrl+F to search.",
    "ja": "セッションログ。Ctrl+F で検索。",
    "zh": "会话日志。按 Ctrl+F 搜索。",
    "ko": "세션 로그. Ctrl+F로 검색.",
    "es": "Registros de sesión. Pulsa Ctrl+F para buscar."
  },
  "บันทึกธีม": {
    "en": "Save Theme",
    "ja": "テーマを保存",
    "zh": "保存主题",
    "ko": "테마 저장",
    "es": "Guardar tema"
  },
  "บันทึกธีมกำหนดเองเรียบร้อยแล้ว": {
    "en": "Custom theme saved successfully",
    "ja": "カスタムテーマを保存しました",
    "zh": "自定义主题已保存",
    "ko": "사용자 지정 테마가 저장되었습니다",
    "es": "Tema personalizado guardado con éxito"
  },
  "บันทึกโปรไฟล์": {
    "en": "Save Profile",
    "ja": "プロファイルを保存",
    "zh": "保存配置文件",
    "ko": "프로필 저장",
    "es": "Guardar perfil"
  },
  "บันทึกโปรไฟล์ {0} เรียบร้อยแล้ว": {
    "en": "Saved profile {0} successfully",
    "ja": "プロファイル {0} を保存しました",
    "zh": "已保存配置文件 {0}",
    "ko": "프로필 {0} 저장 완료",
    "es": "Perfil {0} guardado con éxito"
  },
  "บันทึกโปรไฟล์ไม่สำเร็จ": {
    "en": "Failed to save profile",
    "ja": "プロファイルの保存に失敗しました",
    "zh": "保存配置文件失败",
    "ko": "프로필 저장 실패",
    "es": "Error al guardar el perfil"
  },
  "บันทึกโปรไฟล์ไม่สำเร็จ:": {
    "en": "Failed to save profile:",
    "ja": "プロファイルの保存に失敗:",
    "zh": "保存配置文件失败:",
    "ko": "프로필 저장 실패:",
    "es": "Error al guardar perfil:"
  },
  "บันทึกไม่สำเร็จ": {
    "en": "Failed to save",
    "ja": "保存に失敗しました",
    "zh": "保存失败",
    "ko": "저장 실패",
    "es": "Error al guardar"
  },
  "บันทึกไม่สำเร็จ:": {
    "en": "Failed to save:",
    "ja": "保存に失敗:",
    "zh": "保存失败:",
    "ko": "저장 실패:",
    "es": "Error al guardar:"
  },
  "บันทึกล่าสุดเมื่อสักครู่": {
    "en": "Last saved just now",
    "ja": "さっき保存されました",
    "zh": "刚刚保存",
    "ko": "방금 저장됨",
    "es": "Guardado hace un momento"
  },
  "บันทึกแล้ว": {
    "en": "Saved",
    "ja": "保存完了",
    "zh": "已保存",
    "ko": "저장됨",
    "es": "Guardado"
  },
  "บันทึกและซิงค์ FastFlags": {
    "en": "Save & Sync FastFlags",
    "ja": "FastFlags を保存して同期",
    "zh": "保存并同步 FastFlags",
    "ko": "FastFlags 저장 및 동기화",
    "es": "Guardar y sincronizar FastFlags"
  },
  "บันทึกและซิงค์ FastFlags ไปยัง Voidstrap และ Roblox เรียบร้อยแล้ว": {
    "en": "FastFlags saved and synced to Voidstrap and Roblox successfully",
    "ja": "FastFlags を Voidstrap および Roblox に保存・同期しました",
    "zh": "FastFlags 已成功保存并同步至 Voidstrap 与 Roblox",
    "ko": "FastFlags가 Voidstrap 및 Roblox에 성공적으로 저장 및 동기화되었습니다",
    "es": "FastFlags guardados y sincronizados con Voidstrap y Roblox con éxito"
  },
  "บันทึกและปรับใช้ทันที": {
    "en": "Save and Apply Now",
    "ja": "保存して即座に適用",
    "zh": "立即保存并应用",
    "ko": "지금 저장하고 적용",
    "es": "Guardar y aplicar ahora"
  },
  "บันทึกและปรับใช้ FastFlags JSON เรียบร้อยแล้ว": {
    "en": "FastFlags JSON saved and applied successfully",
    "ja": "FastFlags JSON を保存して適用しました",
    "zh": "FastFlags JSON 已成功保存并应用",
    "ko": "FastFlags JSON이 성공적으로 저장 및 적용되었습니다",
    "es": "FastFlags JSON guardado y aplicado con éxito"
  },
  "บันทึกและปรับใช้ Raw JSON": {
    "en": "Save & Apply Raw JSON",
    "ja": "Raw JSON を保存して適用",
    "zh": "保存并应用原始 JSON",
    "ko": "원시 JSON 저장 및 적용",
    "es": "Guardar y aplicar Raw JSON"
  },
  "บันทึก Flag ไม่สำเร็จ": {
    "en": "Failed to save Flag",
    "ja": "Flag の保存に失敗しました",
    "zh": "保存 Flag 失败",
    "ko": "Flag 저장 실패",
    "es": "Error al guardar Flag"
  },
  "บันทึก Flag ไม่สำเร็จ:": {
    "en": "Failed to save flag:",
    "ja": "Flagの保存に失敗:",
    "zh": "保存 Flag 失败:",
    "ko": "Flag 저장 실패:",
    "es": "Error al guardar flag:"
  },
  "บิลด์น้ำหนักเบา ลดการใช้ RAM และ GPU สำหรับเปิดบอทจำนวนมาก": {
    "en": "Lightweight build with minimal RAM/GPU usage for massive multi-account farming",
    "ja": "大規模周回向けに RAM・GPU 消費を抑えた軽量ビルド",
    "zh": "轻量化优化配置，降低内存及显存开销，适合大规模多开农场",
    "ko": "대규모 다계정 파밍을 위해 RAM 및 GPU 사용량을 최소화한 경량 빌드",
    "es": "Configuración ligera con uso mínimo de RAM y GPU para multi-cuentas"
  },
  "บิลด์ปรับแต่งพิเศษ เข้ากันได้ดีกับ Bloxstrap และ FastFlags Custom": {
    "en": "Special customized build, highly compatible with Bloxstrap & Custom FastFlags",
    "ja": "Bloxstrap およびカスタム FastFlags と互換性のある特別カスタマイズビルド",
    "zh": "特别优化定制版本，深度兼容 Bloxstrap 与自定义 FastFlags",
    "ko": "Bloxstrap 및 사용자 정의 FastFlags와 완벽 호환되는 특수 최적화 빌드",
    "es": "Build especial personalizada, compatible con Bloxstrap y FastFlags"
  },
  "เบต้า (Beta Jitter Simulation)": {
    "en": "Beta Jitter Simulation",
    "ja": "ベータ版ジッターシミュレーション (Beta Jitter Simulation)",
    "zh": "测试版微动模拟 (Beta Jitter Simulation)",
    "ko": "베타 지터 시뮬레이션 (Beta Jitter Simulation)",
    "es": "Simulación beta de temblor"
  },
  "ประเภท": {
    "en": "Type",
    "ja": "タイプ",
    "zh": "类型",
    "ko": "유형",
    "es": "Tipo"
  },
  "ประเภทข้อมูล (Data Type)": {
    "en": "Data Type",
    "ja": "データ型 (Data Type)",
    "zh": "数据类型 (Data Type)",
    "ko": "데이터 타입 (Data Type)",
    "es": "Tipo de datos"
  },
  "ประเภทอวตาร์": {
    "en": "Avatar Type",
    "ja": "アバタータイプ",
    "zh": "虚拟形象类型",
    "ko": "아바타 타입",
    "es": "Tipo de avatar"
  },
  "ประวัติ": {
    "en": "History",
    "ja": "履歴",
    "zh": "历史",
    "ko": "기록",
    "es": "Historial"
  },
  "ประวัติการสร้าง": {
    "en": "Generation History",
    "ja": "生成履歴",
    "zh": "生成历史",
    "ko": "생성 이역",
    "es": "Historial de generación"
  },
  "ประสิทธิภาพและการจำกัด FPS (FPS & Performance)": {
    "en": "FPS & Performance (FPS & Performance)",
    "ja": "パフォーマンスとFPS制限 (FPS & Performance)",
    "zh": "性能与帧率限制 (FPS & Performance)",
    "ko": "성능 및 FPS 제한 (FPS & Performance)",
    "es": "Rendimiento y Límite de FPS (FPS & Performance)"
  },
  "ประสิทธิภาพและเฟรมเรต (Performance & FPS)": {
    "en": "Performance & Framerate (Performance & FPS)",
    "ja": "パフォーマンスとフレームレート (Performance & FPS)",
    "zh": "性能与帧率 (Performance & FPS)",
    "ko": "성능 및 프레임레이트 (Performance & FPS)",
    "es": "Rendimiento y Fotogramas (Performance & FPS)"
  },
  "ประสิทธิภาพ (FPS)": {
    "en": "Performance (FPS)",
    "ja": "パフォーマンス (FPS)",
    "zh": "性能 (FPS)",
    "ko": "성능 (FPS)",
    "es": "Rendimiento (FPS)"
  },
  "ประหยัด GPU/CPU/RAM หน้าต่าง Roblox ที่ไม่ได้โฟกัส": {
    "en": "Save GPU/CPU/RAM on unfocused Roblox windows",
    "ja": "非アクティブな Roblox ウィンドウの GPU/CPU/RAM を節約",
    "zh": "为未聚焦的 Roblox 后台窗口节省 GPU/CPU/RAM 资源",
    "ko": "비활성 Roblox 창의 GPU/CPU/RAM 리소스 절약",
    "es": "Ahorra GPU/CPU/RAM en ventanas de Roblox no enfocadas"
  },
  "ปรับใช้": {
    "en": "Apply",
    "ja": "適用",
    "zh": "应用",
    "ko": "적용",
    "es": "Aplicar"
  },
  "ปรับใช้โปรไฟล์": {
    "en": "Apply Profile",
    "ja": "プロファイルを適用",
    "zh": "应用配置文件",
    "ko": "프로필 적용",
    "es": "Aplicar perfil"
  },
  "ปรับใช้โปรไฟล์ {0} ไปยัง Roblox แล้ว": {
    "en": "Applied profile {0} to Roblox",
    "ja": "プロファイル {0} をRobloxに適用しました",
    "zh": "已将配置文件 {0} 应用到 Roblox",
    "ko": "프로필 {0}을(를) Roblox에 적용했습니다",
    "es": "Perfil {0} aplicado a Roblox"
  },
  "ปรับใช้โปรไฟล์ {0} สำเร็จแล้ว": {
    "en": "Applied profile {0} successfully",
    "ja": "プロファイル {0} を適用しました",
    "zh": "已成功应用配置文件 {0}",
    "ko": "프로필 {0} 적용 완료",
    "es": "Perfil {0} aplicado con éxito"
  },
  "ปรับใช้โปรไฟล์ล้มเหลว": {
    "en": "Failed to apply profile",
    "ja": "プロファイルの適用に失敗しました",
    "zh": "应用配置文件失败",
    "ko": "프로필 적용 실패",
    "es": "Error al aplicar el perfil"
  },
  "ปรับใช้โปรไฟล์ล้มเหลว:": {
    "en": "Failed to apply profile:",
    "ja": "プロファイルの適用に失敗:",
    "zh": "应用配置文件失败:",
    "ko": "프로필 적용 실패:",
    "es": "Error al aplicar perfil:"
  },
  "ปรับแต่ง": {
    "en": "Mixer",
    "ja": "ミキサー",
    "zh": "调音",
    "ko": "믹서",
    "es": "Mezclador"
  },
  "ปรับแต่งการตั้งค่า FastFlags สำหรับโปรไฟล์นี้": {
    "en": "Customize FastFlags settings for this profile",
    "ja": "このプロファイルの FastFlags 設定をカスタマイズ",
    "zh": "为此配置文件自定义 FastFlags 设置",
    "ko": "이 프로필의 FastFlags 설정을 사용자 지정합니다",
    "es": "Personaliza los ajustes de FastFlags para este perfil"
  },
  "ปรับแต่งธีมกำหนดเอง (Custom Theme Builder)": {
    "en": "Custom Theme Builder",
    "ja": "カスタムテーマ作成 (Custom Theme Builder)",
    "zh": "自定义主题编辑器 (Custom Theme Builder)",
    "ko": "사용자 지정 테마 빌더 (Custom Theme Builder)",
    "es": "Constructor de temas personalizados"
  },
  "ปรับแต่งสีไฮไลท์หลักของโปรแกรมด้วยตัวเองหรือเลือกสีด่วน": {
    "en": "Customize the main accent color or pick a quick preset",
    "ja": "アクセントカラーを自由にカスタマイズまたはプリセットから選択",
    "zh": "自定义主要强调色或选择预设颜色",
    "ko": "강조 색상을 직접 지정하거나 빠른 프리셋에서 선택하세요",
    "es": "Personaliza el color de realce o elige un ajuste rápido"
  },
  "ปรับพิกัด Preset เรียบร้อยแล้ว": {
    "en": "Preset coordinates applied successfully",
    "ja": "プリセット座標を適用しました",
    "zh": "预设坐标已成功应用",
    "ko": "프리셋 좌표가 적용되었습니다",
    "es": "Coordenadas predefinidas aplicadas con éxito"
  },
  "ปรับพิกัด Preset เรียบร้อยแล้ว!": {
    "en": "Preset coordinates applied successfully!",
    "ja": "プリセット座標を適用しました！",
    "zh": "预设坐标已成功应用！",
    "ko": "프리셋 좌표가 적용되었습니다!",
    "es": "¡Coordenadas preestablecidas aplicadas con éxito!"
  },
  "ปรับระดับเสียงของหน้าต่าง Roblox โดยตรงทันทีโดยไม่ต้องเปิดใหม่": {
    "en": "Adjust Roblox windows volume instantly without restarting",
    "ja": "再起動せずにRobloxウィンドウの音量を即座に調整",
    "zh": "直接即时调整 Roblox 窗口的音量，无需重新启动",
    "ko": "재부팅 없이 즉시 Roblox 창의 볼륨을 조절합니다",
    "es": "Ajusta el volumen de Roblox al instante sin reiniciar"
  },
  "ปรับระดับเสียงของหน้าต่าง Roblox ที่กำลังรันทันที และจะนำไปใช้กับการเปิดครั้งใหม่ด้วย": {
    "en": "Adjusts running Roblox volume instantly and applies to new launches",
    "ja": "実行中の Roblox 音量を即座に調整し、次回起動時にも引き継ぎます",
    "zh": "立即调整运行中 Roblox 的音量，并同时应用到新启动的窗口",
    "ko": "실행 중인 Roblox 창의 볼륨을 즉시 조절하고 새 실행 시에도 적용합니다",
    "es": "Ajusta el volumen de Roblox en ejecución y lo aplica a nuevos inicios"
  },
  "ปรับระดับเสียงของหน้าต่าง Roblox แบบเรียลไทม์": {
    "en": "Adjust Roblox windows volume in real-time",
    "ja": "Roblox ウィンドウの音量をリアルタイムで調整",
    "zh": "实时调整 Roblox 窗口的音量",
    "ko": "실시간으로 Roblox 창의 볼륨을 조절합니다",
    "es": "Ajusta el volumen de Roblox en tiempo real"
  },
  "ปรับอัลกอริทึมตำแหน่ง CFrame ให้คำนวณเร็วขึ้นในเกมขนาดใหญ่": {
    "en": "Optimize CFrame position calculation algorithm for large maps",
    "ja": "大規模マップ向けに CFrame 位置計算アルゴリズムを高速化",
    "zh": "在大地图中优化 CFrame 位置计算算法以提高性能",
    "ko": "대형 맵에서 CFrame 위치 계산 알고리즘을 최적화하여 연산 속도 향상",
    "es": "Optimiza el algoritmo de cálculo de CFrame en mapas grandes"
  },
  "ปลดล็อก": {
    "en": "Unlock",
    "ja": "ロック解除",
    "zh": "解锁",
    "ko": "잠금 해제",
    "es": "Desbloquear"
  },
  "ปลดล็อก 60 FPS cap ของเอนจิน Roblox ให้แสดงผลได้เต็มประสิทธิภาพตามรีเฟรชเรตหน้าจอ": {
    "en": "Unlock Roblox engine 60 FPS cap to run at your display full refresh rate",
    "ja": "Roblox エンジンの60FPS制限を解除し、モニターのリフレッシュレートに応じた高フレームレートを実現",
    "zh": "解锁 Roblox 引擎默认的 60 FPS 限制，完全发挥显示器高刷新率性能",
    "ko": "Roblox 엔진의 60 FPS 제한을 해제하여 모니터 주사율에 맞춰 부드럽게 플레이하세요",
    "es": "Desbloquea el límite de 60 FPS de Roblox para aprovechar la tasa de refresco del monitor"
  },
  "ปลดล็อกคีย์เข้ารหัสไม่สำเร็จ (คีย์ผิด)": {
    "en": "Failed to unlock with key (Incorrect key)",
    "ja": "キーによるロック解除に失敗しました (キーが間違っています)",
    "zh": "密钥解密失败 (密钥错误)",
    "ko": "암호화 키 잠금 해제 실패 (키 오류)",
    "es": "Error al desbloquear con la clave (Clave incorrecta)"
  },
  "ปลดล็อกจำนวน Asset Preload สูงสุด": {
    "en": "Unlock maximum Asset Preload limit",
    "ja": "最大アセット事前読み込み制限を解除",
    "zh": "解锁最大资产预载上限",
    "ko": "최대 에셋 사전 로드 제한 해제",
    "es": "Desbloquear límite máximo de precarga de recursos"
  },
  "ปลดล็อกระยะซูมกล้องไม่จำกัด (Unlimited Camera Zoom)": {
    "en": "Unlimited Camera Zoom",
    "ja": "無制限カメラズーム (Unlimited Camera Zoom)",
    "zh": "无限制镜头缩放 (Unlimited Camera Zoom)",
    "ko": "무제한 카메라 줌 (Unlimited Camera Zoom)",
    "es": "Zoom de cámara ilimitado"
  },
  "ปลดล็อกระยะซูมกล้องไม่จำกัด (Unlimited Zoom)": {
    "en": "Unlimited Camera Zoom",
    "ja": "無制限カメラズーム (Unlimited Zoom)",
    "zh": "无限制镜头缩放 (Unlimited Zoom)",
    "ko": "무제한 카메라 줌 (Unlimited Zoom)",
    "es": "Zoom de cámara ilimitado"
  },
  "ปลดล็อก Alt+Enter สลับโหมดเต็มจอแท้จริง ลด Latency": {
    "en": "Enable Alt+Enter for true Exclusive Fullscreen with reduced latency",
    "ja": "Alt+Enter を有効化して真の排他フルスクリーンに切り替え、遅延を削減",
    "zh": "启用 Alt+Enter 快捷键切换独占全屏，显著降低显示延迟",
    "ko": "Alt+Enter 단독 전체화면 전환을 활성화하여 레이턴시를 줄입니다",
    "es": "Habilita Alt+Enter para pantalla completa exclusiva y reduce latencia"
  },
  "ปลดล็อก FPS เมื่อโฟกัสหน้าต่าง (Unlock FPS on Focus)": {
    "en": "Unlock FPS on Focus",
    "ja": "フォーカス時に FPS 制限解除 (Unlock FPS on Focus)",
    "zh": "聚焦窗口时解锁 FPS (Unlock FPS on Focus)",
    "ko": "창 포커스 시 FPS 잠금 해제 (Unlock FPS on Focus)",
    "es": "Desbloquear FPS al enfocar"
  },
  "ปลดล็อก FPS สูงสุด (Unlock Max FPS)": {
    "en": "Unlock Max FPS",
    "ja": "最大 FPS 制限解除 (Unlock Max FPS)",
    "zh": "解锁最大 FPS (Unlock Max FPS)",
    "ko": "최대 FPS 잠금 해제 (Unlock Max FPS)",
    "es": "Desbloquear FPS máximos"
  },
  "ปลดล็อก FPS, CFrame Optimize, Render Multithreading, ปิด Blur เพื่อความคมชัดและความลื่นไหลในการต่อสู้": {
    "en": "Unlocked FPS, CFrame optimization, multi-thread rendering, and disabled blur for sharp combat clarity",
    "ja": "FPS制限解除、CFrame最適化、マルチスレッド描画、ブラー無効化で快適な戦闘環境を提供",
    "zh": "解锁帧率、优化 CFrame、多线程渲染并关闭模糊，在对战中获得极致流畅清晰画面",
    "ko": "FPS 해제, CFrame 최적화, 멀티스레드 렌더링, 블러 비활성화로 선명하고 매끄러운 전투 화면",
    "es": "FPS desbloqueados, optimización de CFrame, renderizado multihilo y sin desenfoque para combate nítido"
  },
  "ป้องกันเครื่องสลีป (Prevent Sleep / Do Not Sleep)": {
    "en": "Prevent PC Sleep Mode",
    "ja": "スリープ防止 (Prevent Sleep)",
    "zh": "阻止电脑休眠 (Prevent Sleep)",
    "ko": "PC 절전 모드 방지 (Prevent Sleep)",
    "es": "Evitar modo de suspensión del PC"
  },
  "ป้องกันไม่ให้ Roblox อัปโหลดข้อมูล Error Log ขนาดใหญ่ไปยังเซิร์ฟเวอร์ภายนอก": {
    "en": "Prevent Roblox from uploading large crash logs to external servers",
    "ja": "Roblox による大容量クラッシュログの外部送信を防止",
    "zh": "防止 Roblox 向外部服务器上传大型崩溃日志",
    "ko": "Roblox가 대용량 오류 로그를 외부 서버에 업로드하지 못하도록 방지",
    "es": "Evita que Roblox suba registros de error grandes a servidores externos"
  },
  "ป้องกัน Windows เข้าสู่โหมดสลีปขณะเปิดบอท": {
    "en": "Prevents Windows from entering sleep mode while running accounts",
    "ja": "アカウント稼働中に Windows がスリープに入るのを防止",
    "zh": "在挂机运行期间防止 Windows 进入睡眠模式",
    "ko": "계정 실행 중 Windows가 절전 모드로 진입하지 못하도록 방지",
    "es": "Evita que Windows entre en suspensión mientras se ejecutan cuentas"
  },
  "ปักหมุดหน้าต่าง": {
    "en": "Pin Window",
    "ja": "ウィンドウを最前面に固定",
    "zh": "置顶窗口",
    "ko": "창 고정",
    "es": "Fijar ventana"
  },
  "ป่า": {
    "en": "Forest Green",
    "ja": "フォレストグリーン",
    "zh": "森林绿",
    "ko": "포레스트 그린",
    "es": "Verde bosque"
  },
  "ปิง": {
    "en": "Ping",
    "ja": "Ping",
    "zh": "延迟",
    "ko": "핑",
    "es": "Ping"
  },
  "ปิด": {
    "en": "Close",
    "ja": "閉じる",
    "zh": "关闭",
    "ko": "닫기",
    "es": "Cerrar"
  },
  "ปิดกัน AFK แล้ว": {
    "en": "Anti-AFK disabled",
    "ja": "Anti-AFK を無効化しました",
    "zh": "已关闭防挂机",
    "ko": "Anti-AFK 비활성화됨",
    "es": "Anti-AFK desactivado"
  },
  "ปิดการขยายสเกล DPI (Disable DPI Scaling)": {
    "en": "Disable DPI Scaling",
    "ja": "DPI スケーリング無効化 (Disable DPI Scaling)",
    "zh": "禁用 DPI 缩放 (Disable DPI Scaling)",
    "ko": "DPI 배율 비활성화 (Disable DPI Scaling)",
    "es": "Desactivar escalado de DPI"
  },
  "ปิดการคำนวณเงาของตัวละครผู้เล่นทั้งหมด": {
    "en": "Disables shadow rendering for all player characters",
    "ja": "すべてのプレイヤーキャラクターの影描画を無効化",
    "zh": "关闭所有玩家角色的阴影渲染计算",
    "ko": "모든 플레이어 캐릭터의 그림자 계산 비활성화",
    "es": "Desactiva las sombras de todos los personajes"
  },
  "ปิดการใช้งาน Embed Format": {
    "en": "Disable Embed Format",
    "ja": "埋め込み形式を無効化",
    "zh": "禁用嵌入格式",
    "ko": "임베드 형식 비활성화",
    "es": "Desactivar formato incrustado"
  },
  "ปิดการทำงาน": {
    "en": "Disable",
    "ja": "無効",
    "zh": "禁用",
    "ko": "비활성화",
    "es": "Desactivar"
  },
  "ปิดการทำงานหรือหลุดการเชื่อมต่อ": {
    "en": "Disabled or Disconnected",
    "ja": "無効または切断中",
    "zh": "已禁用或掉线",
    "ko": "비활성 또는 연결 끊김",
    "es": "Desactivado o desconectado"
  },
  "ปิดการปักหมุดหน้าต่างแล้ว": {
    "en": "Window unpinned",
    "ja": "ウィンドウの固定を解除しました",
    "zh": "已取消置顶窗口",
    "ko": "창 고정이 해제되었습니다",
    "es": "Ventana desfijada"
  },
  "ปิดการเรนเดอร์ Texture วัตถุ ลดการใช้ VRAM และเพิ่ม FPS อย่างมหาศาล": {
    "en": "Disable object texture rendering to drastically reduce VRAM and boost FPS",
    "ja": "オブジェクトのテクスチャ描画を無効化し、VRAM消費を大幅削減してFPSを向上",
    "zh": "关闭物体纹理渲染，大幅降低显存占用并极大提升帧率",
    "ko": "오브젝트 텍스처 렌더링을 비활성화하여 VRAM 사용량을 대폭 줄이고 FPS를 대폭 향상",
    "es": "Desactiva texturas para reducir el uso de VRAM y aumentar FPS enormemente"
  },
  "ปิดการลบรอยหยัก (MSAA 1x - ประหยัดสเปก)": {
    "en": "Disable Antialiasing (MSAA 1x - Performance)",
    "ja": "アンチエイリアス無効 (MSAA 1x - パフォーマンス)",
    "zh": "关闭抗锯齿 (MSAA 1x - 高性能)",
    "ko": "안티앨리어싱 끄기 (MSAA 1x - 고성능)",
    "es": "Desactivar suavizado (MSAA 1x - Rendimiento)"
  },
  "ปิดการส่งข้อมูลวิเคราะห์ (Disable Telemetry & Analytics)": {
    "en": "Disable Telemetry & Analytics",
    "ja": "テレメトリ解析を無効化 (Disable Telemetry)",
    "zh": "禁用遥测与数据分析 (Disable Telemetry)",
    "ko": "원격 분석 데이터 수집 비활성화 (Disable Telemetry)",
    "es": "Desactivar telemetría y analítica"
  },
  "ปิดความโปร่งใสอัตโนมัติแล้ว": {
    "en": "Auto window opacity disabled",
    "ja": "自動透明度調整を無効化しました",
    "zh": "已关闭自动窗口透明度",
    "ko": "자동 창 투명도가 비활성화되었습니다",
    "es": "Opacidad automática desactivada"
  },
  "ปิดเงาตัวละคร (Disable Player Shadows)": {
    "en": "Disable Player Shadows",
    "ja": "プレイヤーの影を無効化 (Disable Player Shadows)",
    "zh": "关闭玩家阴影 (Disable Player Shadows)",
    "ko": "플레이어 그림자 끄기 (Disable Player Shadows)",
    "es": "Desactivar sombras de jugadores"
  },
  "ปิดใช้งาน": {
    "en": "Disabled",
    "ja": "無効",
    "zh": "已禁用",
    "ko": "비활성화됨",
    "es": "Desactivado"
  },
  "ปิดใช้งานระบบเรียกคืนหน้าต่าง": {
    "en": "Window restore system disabled",
    "ja": "ウィンドウ復帰システムを無効化",
    "zh": "已停用窗口恢复机制",
    "ko": "창 복원 시스템 비활성화됨",
    "es": "Sistema de restauración de ventanas desactivado"
  },
  "ปิดใช้งาน Discord Rich Presence แล้ว": {
    "en": "Discord Rich Presence disabled",
    "ja": "Discord Rich Presence を無効化しました",
    "zh": "已停用 Discord Rich Presence",
    "ko": "Discord Rich Presence가 비활성화되었습니다",
    "es": "Discord Rich Presence desactivado"
  },
  "ปิดเท็กซ์เจอร์ทั้งหมด (Remove Textures - FPS Boost)": {
    "en": "Remove Textures (FPS Boost)",
    "ja": "全テクスチャ削除 (FPS Boost)",
    "zh": "移除所有纹理 (大幅提升帧率)",
    "ko": "모든 텍스처 제거 (FPS 대폭 향상)",
    "es": "Eliminar texturas (FPS Boost)"
  },
  "ปิดเท็กซ์เจอร์พื้นผิวโลก (Disable Terrain Textures)": {
    "en": "Disable Terrain Textures",
    "ja": "地形テクスチャを無効化 (Disable Terrain Textures)",
    "zh": "禁用地形纹理 (Disable Terrain Textures)",
    "ko": "지형 텍스처 비활성화 (Disable Terrain Textures)",
    "es": "Desactivar texturas del terreno"
  },
  "ปิดเบลอพื้นหลังเมนู Esc (No GUI Blur)": {
    "en": "No GUI Blur",
    "ja": "メニューブラー無効 (No GUI Blur)",
    "zh": "禁用界面背景模糊 (No GUI Blur)",
    "ko": "메뉴 배경 블러 끄기 (No GUI Blur)",
    "es": "Sin desenfoque de menú Esc"
  },
  "ปิดเบลอเมนู GUI (No GUI Blur)": {
    "en": "No GUI Blur",
    "ja": "メニューブラー無効 (No GUI Blur)",
    "zh": "禁用界面背景模糊 (No GUI Blur)",
    "ko": "메뉴 배경 블러 끄기 (No GUI Blur)",
    "es": "Sin desenfoque de GUI"
  },
  "ปิดโปรเซสไม่สำเร็จ": {
    "en": "Failed to terminate process",
    "ja": "プロセスの終了に失敗しました",
    "zh": "结束进程失败",
    "ko": "프로세스 종료 실패",
    "es": "Error al terminar el proceso"
  },
  "ปิดระบบส่งสถิติ Telemetry (Disable Telemetry)": {
    "en": "Disable Telemetry",
    "ja": "テレメトリ送信を無効化 (Disable Telemetry)",
    "zh": "禁用遥测统计上传 (Disable Telemetry)",
    "ko": "텔레메트리 전송 비활성화 (Disable Telemetry)",
    "es": "Desactivar envío de telemetría"
  },
  "ปิดเสียงตาย (Silence / Muted)": {
    "en": "Mute Death Sound (Silence / Muted)",
    "ja": "死亡音をミュート (Silence / Muted)",
    "zh": "静音死亡音效 (Silence / Muted)",
    "ko": "사망 효과음 음소거 (Silence / Muted)",
    "es": "Silenciar sonido de muerte (Silence / Muted)"
  },
  "ปิดหน้าต่าง": {
    "en": "Close Window",
    "ja": "ウィンドウを閉じる",
    "zh": "关闭窗口",
    "ko": "창 닫기",
    "es": "Cerrar ventana"
  },
  "ปิดหน้าต่างนี้": {
    "en": "Close this window",
    "ja": "このウィンドウを閉じる",
    "zh": "关闭此窗口",
    "ko": "이 창 닫기",
    "es": "Cerrar esta ventana"
  },
  "ปิดโหมดป้องกันเครื่องสลีปแล้ว": {
    "en": "Sleep prevention disabled",
    "ja": "スリープ防止を無効化しました",
    "zh": "已关闭防休眠模式",
    "ko": "절전 모드 방지가 비활성화되었습니다",
    "es": "Modo anti-suspensión desactivado"
  },
  "ปิดอินสแตนซ์": {
    "en": "Close Instance",
    "ja": "インスタンスを終了",
    "zh": "关闭实例",
    "ko": "인스턴스 종료",
    "es": "Cerrar instancia"
  },
  "ปิดอินสแตนซ์ของ": {
    "en": "Closing instance for",
    "ja": "次のインスタンスを終了:",
    "zh": "正在关闭以下实例:",
    "ko": "다음 계정의 인스턴스 종료:",
    "es": "Cerrando instancia de"
  },
  "ปิดอินสแตนซ์ของ {0} แล้ว": {
    "en": "Closed instance for {0}",
    "ja": "{0} のインスタンスを終了しました",
    "zh": "已关闭 {0} 的实例",
    "ko": "{0}의 인스턴스를 종료했습니다",
    "es": "Instancia cerrada para {0}"
  },
  "ปิดอินสแตนซ์นี้": {
    "en": "Close this instance",
    "ja": "このインスタンスを終了",
    "zh": "关闭此实例",
    "ko": "이 인스턴스 종료",
    "es": "Cerrar esta instancia"
  },
  "ปิดอินสแตนซ์ Roblox ทั้งหมดแล้ว": {
    "en": "All Roblox instances closed",
    "ja": "すべての Roblox インスタンスを終了しました",
    "zh": "已关闭所有 Roblox 实例",
    "ko": "모든 Roblox 인스턴스가 종료되었습니다",
    "es": "Todas las instancias de Roblox cerradas"
  },
  "ปิดเอฟเฟกต์เบลอพื้นหลังเวลาเปิดหน้าจอเมนู Roblox Esc": {
    "en": "Disable background blur when opening Roblox Escape menu",
    "ja": "Roblox Esc メニューを開いたときの背景ブラー効果を無効化",
    "zh": "关闭打开 Roblox Esc 菜单时的背景模糊效果",
    "ko": "Roblox Esc 메뉴를 열 때 배경 블러 효과 비활성화",
    "es": "Desactivar desenfoque de fondo al abrir menú Escape de Roblox"
  },
  "ปิดเอฟเฟกต์เบลอและแสงฟุ้ง (Disable PostFX)": {
    "en": "Disable PostFX",
    "ja": "PostFX 効果を無効化 (Disable PostFX)",
    "zh": "禁用后处理特效 (Disable PostFX)",
    "ko": "후처리 특수효과 끄기 (Disable PostFX)",
    "es": "Desactivar efectos PostFX"
  },
  "ปิดเอฟเฟกต์ PostFX ทั้งหมด (Disable PostFX)": {
    "en": "Disable All PostFX",
    "ja": "すべての PostFX を無効化 (Disable PostFX)",
    "zh": "禁用所有后处理特效 (Disable PostFX)",
    "ko": "모든 후처리 효과 끄기 (Disable PostFX)",
    "es": "Desactivar todos los PostFX"
  },
  "ปิด Bloom, Blur, SunRays เพื่อภาพคมชัดและลื่นไหลขึ้น": {
    "en": "Disable Bloom, Blur, and SunRays for maximum clarity and framerate",
    "ja": "ブルーム、ブラー、サンレイを無効化して視認性とFPSを向上",
    "zh": "关闭 Bloom、Blur、SunRays 特效以获得更高帧率与清晰画面",
    "ko": "Bloom, Blur, SunRays 효과를 꺼서 화면을 선명하고 부드럽게 유지",
    "es": "Desactiva Bloom, Blur y SunRays para mayor fluidez y claridad"
  },
  "ปิด Bloom, SunRays, Blur เพิ่มอัตราเฟรมเรตและช่วยให้ภาพคมชัดขึ้น": {
    "en": "Disable Bloom, SunRays, Blur to boost framerate and clarity",
    "ja": "ブルーム、サンレイ、ブラーを無効化してFPSと視認性を向上",
    "zh": "关闭光晕、光芒与动态模糊，提升帧率并使画面更清晰",
    "ko": "블룸, 광선, 블러를 꺼서 프레임을 높이고 선명도 향상",
    "es": "Desactiva Bloom, SunRays y Blur para mejorar FPS y nitidez"
  },
  "ปิด DPI Scaling (Fix DPI Blur)": {
    "en": "Disable DPI Scaling (Fix DPI Blur)",
    "ja": "DPI スケーリング無効化 (ボケ解消)",
    "zh": "禁用 DPI 缩放 (修复高分屏模糊)",
    "ko": "DPI 배율 비활성화 (화면 흐림 해결)",
    "es": "Desactivar escalado DPI (corrige borrosidad)"
  },
  "ปิด (Off)": {
    "en": "Off",
    "ja": "無効",
    "zh": "关闭",
    "ko": "끔",
    "es": "Apagado"
  },
  "ปิด (Off - ไม่จำกัด)": {
    "en": "Off (Unlimited)",
    "ja": "オフ (無制限)",
    "zh": "关闭 (无限制)",
    "ko": "꺼짐 (무제한)",
    "es": "Desactivado (Ilimitado)"
  },
  "ปิด Roblox": {
    "en": "Kill Roblox",
    "ja": "Robloxを終了",
    "zh": "关闭 Roblox",
    "ko": "Roblox 종료",
    "es": "Cerrar Roblox"
  },
  "ปิด Roblox ทั้งหมด": {
    "en": "Kill All Roblox",
    "ja": "すべての Roblox を強制終了",
    "zh": "结束所有 Roblox 进程",
    "ko": "모든 Roblox 강제 종료",
    "es": "Cerrar todo Roblox"
  },
  "ปิด Roblox ทั้งหมดแล้ว": {
    "en": "All Roblox processes terminated",
    "ja": "すべての Roblox プロセスを終了しました",
    "zh": "已结束所有 Roblox 进程",
    "ko": "모든 Roblox 프로세스가 종료되었습니다",
    "es": "Todos los procesos de Roblox terminados"
  },
  "ปิด Roblox ทั้งหมดแล้ว ({0} ที่กำลังรัน: {1})": {
    "en": "All Roblox processes terminated ({0} running: {1})",
    "ja": "すべての Roblox プロセスを終了しました ({0} 件実行中: {1})",
    "zh": "已结束所有 Roblox 进程 ({0} 运行中: {1})",
    "ko": "모든 Roblox 프로세스 종료됨 ({0} 실행 중: {1})",
    "es": "Todos los procesos de Roblox terminados ({0} en ejecución: {1})"
  },
  "ปิด Roblox สำหรับ": {
    "en": "Close Roblox for",
    "ja": "次のRobloxを終了:",
    "zh": "关闭 Roblox 实例:",
    "ko": "다음 계정의 Roblox 종료:",
    "es": "Cerrar Roblox para"
  },
  "ปิด Roblox สำหรับ {0} แล้ว": {
    "en": "Closed Roblox for {0}",
    "ja": "{0} のRobloxを終了しました",
    "zh": "已为 {0} 关闭 Roblox",
    "ko": "{0}의 Roblox를 종료했습니다",
    "es": "Roblox cerrado para {0}"
  },
  "ปิด Texture, Low Poly, ปิดเงา, ปิด PostFX เพื่อประหยัด CPU/VRAM สูงสุดสำหรับการฟาร์มหลายจอ": {
    "en": "No Textures, Low Poly, No Shadows, No PostFX for maximum multi-account farming efficiency",
    "ja": "テクスチャ無効、Low Poly、影OFF、PostFX OFFで複数垢周回のCPU/VRAMを最大節約",
    "zh": "关闭纹理、Low Poly、关闭阴影、关闭后处理特效，实现多开农场极致性能",
    "ko": "텍스처 제거, 로우 폴리, 그림자 OFF, 후처리 OFF로 다계정 파밍 시 CPU/VRAM 최대 절약",
    "es": "Sin texturas, Low Poly, sin sombras ni PostFX para máxima eficiencia al farmear"
  },
  "ปีที่แล้ว": {
    "en": "years ago",
    "ja": "年前",
    "zh": "年前",
    "ko": "년 전",
    "es": "años atrás"
  },
  "ปุ่มลิงก์บน Discord Profile (Interactive Buttons)": {
    "en": "Interactive Buttons on Discord Profile",
    "ja": "Discord プロフィールのリンクボタン (Interactive Buttons)",
    "zh": "Discord 个人资料互动按钮 (Interactive Buttons)",
    "ko": "Discord 프로필의 인터랙티브 버튼 (Interactive Buttons)",
    "es": "Botones interactivos en perfil de Discord"
  },
  "ปุ่มสั่งการเชื่อมต่อด่วน": {
    "en": "Quick Connect Actions",
    "ja": "クイック接続コマンド",
    "zh": "快捷连接指令",
    "ko": "빠른 연결 제어 버튼",
    "es": "Acciones rápidas de conexión"
  },
  "ปุ่มสั่งการหน้าต่างด่วน": {
    "en": "Quick Window Action Buttons",
    "ja": "クイックウィンドウ操作ボタン",
    "zh": "快捷窗口操作按钮",
    "ko": "빠른 창 제어 버튼",
    "es": "Botones de acción rápida de ventanas"
  },
  "เปลี่ยนคีย์เข้ารหัสได้ที่นี่ คุณจะต้องใส่อีกครั้งเมื่อเปิดครั้งถัดไป": {
    "en": "Change key here. You must re-enter it on the next launch.",
    "ja": "キーの変更。次回起動時に入力が必要になります。",
    "zh": "在此更改密钥。下次启动时您需要再次输入。",
    "ko": "여기서 키를 변경합니다. 다음 실행 시 다시 입력해야 합니다.",
    "es": "Cambia la clave. Deberás introducirla al reiniciar."
  },
  "เปลี่ยนท้องฟ้า 3D เป็นสีเทาเรียบ ช่วยประหยัดทรัพยากรการ์ดจอ": {
    "en": "Replaces 3D sky with flat solid gray to save GPU power",
    "ja": "3Dスカイをフラットなグレーに変更し、GPUリソースを節約",
    "zh": "将 3D 天空替换为单色灰色，节约显卡算力",
    "ko": "3D 하늘을 단색 회색으로 변경하여 그래픽카드 리소스를 절약합니다",
    "es": "Cambia el cielo 3D por gris liso para ahorrar GPU"
  },
  "เปลี่ยนภาษาเป็น": {
    "en": "Language changed to",
    "ja": "言語を変更しました:",
    "zh": "语言已更改为",
    "ko": "언어가 다음으로 변경됨:",
    "es": "Idioma cambiado a"
  },
  "เปลี่ยนรูปเคอร์เซอร์เมาส์ที่แสดงผลภายในเกม": {
    "en": "Change mouse cursor displayed in-game",
    "ja": "ゲーム内で表示されるマウスポインターを変更",
    "zh": "更改游戏内显示的鼠标指针图标",
    "ko": "게임 내 마우스 커서 아이콘 변경",
    "es": "Cambiar el cursor del ratón mostrado en el juego"
  },
  "เปิด": {
    "en": "Open",
    "ja": "開く",
    "zh": "打开",
    "ko": "열기",
    "es": "Abrir"
  },
  "เปิดกัน AFK แล้ว บัญชีจะไม่หลุดการเชื่อมต่อ": {
    "en": "Anti-AFK active: accounts will not disconnect",
    "ja": "Anti-AFK 有効: アカウントの接続は維持されます",
    "zh": "防挂机已开启: 账户不会掉线",
    "ko": "Anti-AFK 활성화됨: 계정이 튕기지 않습니다",
    "es": "Anti-AFK activo: las cuentas no se desconectarán"
  },
  "เปิดกัน AFK ไว้ตอนเริ่มต้น (กำลังทำงาน)": {
    "en": "Anti-AFK enabled at startup (Active)",
    "ja": "起動時に Anti-AFK 有効 (動作中)",
    "zh": "启动时默认启用防挂机 (运行中)",
    "ko": "시작 시 Anti-AFK 켜기 (실행 중)",
    "es": "Anti-AFK activado al iniciar (Activo)"
  },
  "เปิดกัน AFK ไว้ตอนเริ่มต้น (กำลังทำงาน": {
    "en": "Anti-AFK enabled at startup (Active",
    "ja": "起動時に Anti-AFK 有効 (動作中",
    "zh": "启动时默认启用防挂机 (运行中",
    "ko": "시작 시 Anti-AFK 켜기 (실행 중",
    "es": "Anti-AFK activado al iniciar (Activo"
  },
  "เปิดกัน AFK ไว้ตอนเริ่มต้น (กำลังทำงาน: {0})": {
    "en": "Anti-AFK active on startup (Running: {0})",
    "ja": "起動時にAnti-AFKを有効化 (動作中: {0})",
    "zh": "启动时已启用防挂机 (运行中: {0})",
    "ko": "시작 시 Anti-AFK 활성화됨 (실행 중: {0})",
    "es": "Anti-AFK activado al inicio (Activo: {0})"
  },
  "เปิดการปักหมุดหน้าต่างแล้ว": {
    "en": "Window pinned on top",
    "ja": "ウィンドウを最前面に固定しました",
    "zh": "已将窗口置顶显示",
    "ko": "창이 항상 위에 고정되었습니다",
    "es": "Ventana fijada al frente"
  },
  "เปิดเกม": {
    "en": "Launch Game",
    "ja": "ゲームを起動",
    "zh": "启动游戏",
    "ko": "게임 실행",
    "es": "Iniciar juego"
  },
  "เปิดเกมแล้วในชื่อ": {
    "en": "Game launched as",
    "ja": "ゲームを起動しました:",
    "zh": "已启动游戏:",
    "ko": "게임 실행됨:",
    "es": "Juego iniciado como"
  },
  "เปิดเกมสำเร็จ": {
    "en": "Game launched successfully",
    "ja": "ゲームの起動に成功しました",
    "zh": "游戏启动成功",
    "ko": "게임 실행 성공",
    "es": "Juego iniciado con éxito"
  },
  "เปิดความโปร่งใสอัตโนมัติแล้ว": {
    "en": "Auto window opacity enabled",
    "ja": "自動透明度調整を有効化しました",
    "zh": "已开启自动窗口透明度",
    "ko": "자동 창 투명도가 활성화되었습니다",
    "es": "Opacidad automática activada"
  },
  "เปิดใช้งานปุ่มที่ 1": {
    "en": "Enable Button 1",
    "ja": "ボタン1を有効化",
    "zh": "启用按钮 1",
    "ko": "버튼 1 활성화",
    "es": "Activar botón 1"
  },
  "เปิดใช้งานปุ่มที่ 2": {
    "en": "Enable Button 2",
    "ja": "ボタン2を有効化",
    "zh": "启用按钮 2",
    "ko": "버튼 2 활성화",
    "es": "Activar botón 2"
  },
  "เปิดใช้งานมัลติเธรดสำหรับงาน Render Thread กระจายโหลดลงทุกคอร์ CPU": {
    "en": "Enable multithreaded rendering to distribute load across all CPU cores",
    "ja": "マルチスレッドレンダリングを有効化し、CPU全コアに負荷を分散",
    "zh": "启用多线程渲染任务，将渲染负载均衡到全部 CPU 核心",
    "ko": "렌더링 멀티스레드를 활성화하여 모든 CPU 코어에 로드를 분산",
    "es": "Activa renderizado multihilo para distribuir la carga entre núcleos de la CPU"
  },
  "เปิดใช้งานรหัสผ่าน (Active)": {
    "en": "Password Lock Enabled (Active)",
    "ja": "パスワード保護有効 (Active)",
    "zh": "密码锁已启用 (Active)",
    "ko": "비밀번호 잠금 활성화됨 (Active)",
    "es": "Bloqueo con contraseña activado (Activo)"
  },
  "เปิดใช้งานระบบกัน AFK": {
    "en": "Enable Anti-AFK System",
    "ja": "Anti-AFK システムを有効化",
    "zh": "启用防挂机系统",
    "ko": "Anti-AFK 시스템 활성화",
    "es": "Activar sistema Anti-AFK"
  },
  "เปิดใช้งานโหมด Exclusive Fullscreen ป้องกันดีเลย์และเพิ่ม FPS": {
    "en": "Enable Exclusive Fullscreen mode to reduce input lag and improve FPS",
    "ja": "排他フルスクリーンモードを有効化して遅延を削減しFPSを向上",
    "zh": "启用独占全屏模式，消除输入延迟并提升帧率",
    "ko": "단독 전체화면 모드를 활성화하여 입력 지연을 줄이고 FPS를 향상시킵니다",
    "es": "Activa el modo pantalla completa exclusiva para evitar retardo y ganar FPS"
  },
  "เปิดใช้งาน Discord Activity": {
    "en": "Enable Discord Activity",
    "ja": "Discord アクティビティを有効化",
    "zh": "启用 Discord 活动状态",
    "ko": "Discord 활동 상태 활성화",
    "es": "Activar actividad en Discord"
  },
  "เปิดใช้งาน Discord Rich Presence": {
    "en": "Enable Discord Rich Presence",
    "ja": "Discord Rich Presence を有効化",
    "zh": "启用 Discord Rich Presence",
    "ko": "Discord Rich Presence 활성화",
    "es": "Activar Discord Rich Presence"
  },
  "เปิดใช้งาน Discord Rich Presence แล้ว": {
    "en": "Discord Rich Presence enabled",
    "ja": "Discord Rich Presence を有効化しました",
    "zh": "已启用 Discord Rich Presence",
    "ko": "Discord Rich Presence가 활성화되었습니다",
    "es": "Discord Rich Presence activado"
  },
  "เปิดใช้งาน Discord Webhook": {
    "en": "Enable Discord Webhook",
    "ja": "Discord Webhook を有効化",
    "zh": "启用 Discord Webhook",
    "ko": "Discord Webhook 활성화",
    "es": "Activar Discord Webhook"
  },
  "เปิดตลอด": {
    "en": "Always On",
    "ja": "常時有効",
    "zh": "始终开启",
    "ko": "항상 활성화",
    "es": "Siempre activo"
  },
  "เปิดแถบแสดงสถานะ FPS และความหน่วงเฟรมแบบเนทีฟของ Roblox Engine": {
    "en": "Display native Roblox Engine FPS and frame-latency performance overlay",
    "ja": "Roblox Engine ネイティブの FPS およびフレーム遅延オーバーレイを表示",
    "zh": "显示 Roblox 引擎原生 FPS 及帧延迟状态栏",
    "ko": "Roblox 엔진의 네이티브 FPS 및 프레임 레이턴시 오버레이를 표시합니다",
    "es": "Muestra la barra nativa de FPS y latencia de fotogramas de Roblox Engine"
  },
  "เปิดทั้งชุดได้ในคลิกเดียวจากแท็บกลุ่ม": {
    "en": "Launch the entire batch with one click from the Packages tab",
    "ja": "グループタブからワンクリックで一括起動",
    "zh": "在群组标签下一键启动全部账户",
    "ko": "그룹 탭에서 원클릭으로 일괄 실행",
    "es": "Abre todo el lote con un clic desde la pestaña Grupos"
  },
  "เปิดเบราว์เซอร์เข้าสู่ระบบไม่สำเร็จ": {
    "en": "Failed to open browser login view",
    "ja": "ブラウザログイン画面の起動に失敗しました",
    "zh": "打开浏览器登录窗口失败",
    "ko": "브라우저 로그인 창을 열지 못했습니다",
    "es": "Error al abrir la ventana de inicio de sesión del navegador"
  },
  "เปิดโปรแกรมพร้อม Windows (Auto Launch on Boot)": {
    "en": "Launch MultiRoblox on Windows Startup",
    "ja": "Windows 起動時に自動起動 (Auto Launch on Boot)",
    "zh": "开机自动启动 MultiRoblox (Auto Launch on Boot)",
    "ko": "Windows 시작 시 MultiRoblox 자동 실행 (Auto Launch on Boot)",
    "es": "Iniciar con Windows automáticamente"
  },
  "เปิดโปรไฟล์ไม่สำเร็จ": {
    "en": "Failed to open profile",
    "ja": "プロファイルを開けませんでした",
    "zh": "打开配置文件失败",
    "ko": "프로필을 열지 못했습니다",
    "es": "Error al abrir el perfil"
  },
  "เปิดโปรไฟล์ไม่สำเร็จ:": {
    "en": "Failed to open profile:",
    "ja": "プロファイルを開けませんでした:",
    "zh": "打开配置文件失败:",
    "ko": "프로필 열기 실패:",
    "es": "Error al abrir perfil:"
  },
  "เปิดผ่าน Bloxstrap.exe": {
    "en": "Launch via Bloxstrap.exe",
    "ja": "Bloxstrap.exe 経由で起動",
    "zh": "通过 Bloxstrap.exe 启动",
    "ko": "Bloxstrap.exe를 통해 실행",
    "es": "Abrir con Bloxstrap.exe"
  },
  "เปิดผ่าน RobloxPlayerBeta.exe โดยตรง รวดเร็วและเสถียรที่สุด": {
    "en": "Launch directly via RobloxPlayerBeta.exe (Fastest & most stable)",
    "ja": "RobloxPlayerBeta.exe から直接起動 (最速かつ安定)",
    "zh": "直接通过 RobloxPlayerBeta.exe 启动 (最快且最稳定)",
    "ko": "RobloxPlayerBeta.exe로 직접 실행 (가장 빠르고 안정적)",
    "es": "Abrir directamente con RobloxPlayerBeta.exe (más rápido y estable)"
  },
  "เปิดผ่าน Voidstrap.exe ใช้งาน Mods และ FastFlags แบบเต็มรูปแบบ": {
    "en": "Launch via Voidstrap.exe with full Mods and FastFlags support",
    "ja": "Voidstrap.exe 経由で起動し、Mods と FastFlags を完全サポート",
    "zh": "通过 Voidstrap.exe 启动，完整支持 Mods 与 FastFlags",
    "ko": "Voidstrap.exe를 통해 실행하여 모드 및 FastFlags를 완벽 지원합니다",
    "es": "Abrir con Voidstrap.exe con soporte completo para Mods y FastFlags"
  },
  "เปิดโฟลเดอร์ Mods ของ MultiRoblox": {
    "en": "Open MultiRoblox Mods Folder",
    "ja": "MultiRoblox の Mods フォルダを開く",
    "zh": "打开 MultiRoblox Mods 文件夹",
    "ko": "MultiRoblox 모드 폴더 열기",
    "es": "Abrir carpeta de Mods de MultiRoblox"
  },
  "เปิดไม่สำเร็จสำหรับ": {
    "en": "Launch failed for",
    "ja": "起動失敗:",
    "zh": "启动失败:",
    "ko": "실행 실패:",
    "es": "Error al iniciar para"
  },
  "เปิดไม่สำเร็จสำหรับ {0}: {1}": {
    "en": "Launch failed for {0}: {1}",
    "ja": "{0} の起動に失敗: {1}",
    "zh": "{0} 启动失败: {1}",
    "ko": "{0} 실행 실패: {1}",
    "es": "Error al iniciar para {0}: {1}"
  },
  "เปิดรัน Roblox เพื่อดูข้อมูลสถานะการเล่น ระยะเวลา และการปรับแต่งระดับเสียงรายบัญชี": {
    "en": "Launch Roblox to view play status, duration, and per-account volume controls",
    "ja": "Roblox を起動して、プレイ状況、稼働時間、アカウントごとの音量調整を確認",
    "zh": "运行 Roblox 以查看游戏状态、运行时间及每个账户的音量调整",
    "ko": "Roblox를 실행하여 플레이 상태, 플레이 시간 및 계정별 볼륨 조절을 확인하세요",
    "es": "Abre Roblox para ver estado, tiempo de juego y ajuste de volumen por cuenta"
  },
  "เปิดแสดงแถบ FPS และ Frame Time ดั้งเดิมของ Roblox": {
    "en": "Show native Roblox FPS and Frame Time bar",
    "ja": "Roblox ネイティブの FPS および Frame Time バーを表示",
    "zh": "显示 Roblox 原生 FPS 与帧生成时间条",
    "ko": "Roblox 원본 FPS 및 프레임 타임 바 표시",
    "es": "Muestra la barra nativa de FPS y tiempo de fotograma de Roblox"
  },
  "เปิดหน้าต่างเข้าสู่ระบบ Roblox โดยตรง": {
    "en": "Open Roblox Login Window Directly",
    "ja": "Roblox ログインウィンドウを直接開く",
    "zh": "直接打开 Roblox 登录窗口",
    "ko": "Roblox 로그인 창 직접 열기",
    "es": "Abrir ventana de inicio de sesión de Roblox directamente"
  },
  "เปิดหน้าแรก": {
    "en": "Open Home",
    "ja": "ホームを開く",
    "zh": "打开主页",
    "ko": "홈 열기",
    "es": "Abrir inicio"
  },
  "เปิดหน้าหลัก": {
    "en": "Open Home",
    "ja": "ホームを開く",
    "zh": "打开主页",
    "ko": "홈 열기",
    "es": "Abrir inicio"
  },
  "เปิดหน้าหลัก (Home)": {
    "en": "Open Home Page",
    "ja": "ホームページを開く (Home)",
    "zh": "打开主页 (Home)",
    "ko": "홈페이지 열기 (Home)",
    "es": "Abrir página principal (Home)"
  },
  "เปิดหน้าไอเทมในเบราว์เซอร์": {
    "en": "Open item page in browser",
    "ja": "ブラウザでアイテムページを開く",
    "zh": "在浏览器中打开道具页面",
    "ko": "브라우저에서 아이템 페이지 열기",
    "es": "Abrir página del objeto en el navegador"
  },
  "')\" เปิดหน้าไอเทมในเบราว์เซอร์": {
    "en": "Open item page in browser",
    "ja": "ブラウザでアイテムページを開く",
    "zh": "在浏览器中打开道具页面",
    "ko": "브라우저에서 아이템 페이지 열기",
    "es": "Abrir página del objeto en el navegador"
  },
  "เปิดโหมดป้องกันเครื่องสลีปแล้ว": {
    "en": "Sleep prevention mode enabled",
    "ja": "スリープ防止モードを有効化しました",
    "zh": "已启用防电脑休眠模式",
    "ko": "절전 모드 방지가 활성화되었습니다",
    "es": "Modo anti-suspensión activado"
  },
  "เปิดใหม่": {
    "en": "Restart",
    "ja": "再起動",
    "zh": "重新打开",
    "ko": "다시 열기",
    "es": "Reiniciar"
  },
  "เปิดอยู่": {
    "en": "Running",
    "ja": "起動中",
    "zh": "已打开",
    "ko": "실행 중",
    "es": "Abierto"
  },
  "เปิด Anti-AFK อัตโนมัติ": {
    "en": "Auto Enable Anti-AFK",
    "ja": "Anti-AFK 自動有効化",
    "zh": "自动开启防挂机",
    "ko": "Anti-AFK 자동 실행",
    "es": "Activar Anti-AFK automáticamente"
  },
  "เปิด Roblox ตามปกติ": {
    "en": "Launch Roblox Normally",
    "ja": "Roblox を通常起動",
    "zh": "正常启动 Roblox",
    "ko": "Roblox 일반 모드로 실행",
    "es": "Abrir Roblox normalmente"
  },
  "เปิด Roblox แล้วในชื่อ": {
    "en": "Roblox launched as",
    "ja": "次の名前で Roblox を起動しました:",
    "zh": "已启动 Roblox，用户为:",
    "ko": "다음 계정으로 Roblox 실행됨:",
    "es": "Roblox iniciado como"
  },
  "เปิด Roblox แล้วในชื่อ {0} (กลุ่ม)": {
    "en": "Roblox launched as {0} (Package)",
    "ja": "{0} としてRobloxを起動しました (パッケージ)",
    "zh": "已以 {0} 身份启动 Roblox (群组)",
    "ko": "{0}(으)로 Roblox 실행 완료 (그룹)",
    "es": "Roblox iniciado como {0} (Grupo)"
  },
  "เปิด Roblox แล้วในชื่อ {0} เข้าแมพ {1}": {
    "en": "Roblox launched as {0} into map {1}",
    "ja": "{0} としてマップ {1} にRobloxを起動しました",
    "zh": "已以 {0} 身份启动 Roblox 进入地图 {1}",
    "ko": "{0}(으)로 맵 {1}에 Roblox 실행 완료",
    "es": "Roblox iniciado como {0} en el mapa {1}"
  },
  "เปิด Roblox สำเร็จในชื่อ": {
    "en": "Roblox launched successfully as",
    "ja": "次の名前で Roblox の起動に成功しました:",
    "zh": "已成功以以下身份启动 Roblox:",
    "ko": "다음 계정으로 Roblox 실행 성공:",
    "es": "Roblox iniciado con éxito como"
  },
  "เปิด Roblox สำเร็จในชื่อ {0}": {
    "en": "Roblox launched successfully as {0}",
    "ja": "{0} としてRobloxの起動に成功しました",
    "zh": "已成功以 {0} 身份启动 Roblox",
    "ko": "{0}(으)로 Roblox 실행 성공",
    "es": "Roblox iniciado con éxito como {0}"
  },
  "เปิด Roblox สำหรับ": {
    "en": "Launching Roblox for",
    "ja": "Roblox を起動中:",
    "zh": "正在启动 Roblox:",
    "ko": "Roblox 실행 중:",
    "es": "Iniciando Roblox para"
  },
  "โปรแกรมเปิดเกม (Client Bootstrapper Integration)": {
    "en": "Client Bootstrapper Integration",
    "ja": "クライアントブートストラップ連携 (Bootstrapper Integration)",
    "zh": "客户端引导程序集成 (Bootstrapper Integration)",
    "ko": "클라이언트 부트스트래퍼 연동 (Bootstrapper Integration)",
    "es": "Integración del Bootstrapper del cliente"
  },
  "โปรดรอสักครู่ ระบบกำลังดาวน์โหลดตัวเกมจาก Roblox CDN...": {
    "en": "Please wait, downloading client from Roblox CDN...",
    "ja": "お待ちください。Roblox CDN からクライアントをダウンロード中...",
    "zh": "请稍候，正在从 Roblox CDN 下载游戏客户端...",
    "ko": "잠시만 기다려주세요. Roblox CDN에서 클라이언트를 다운로드하는 중...",
    "es": "Por favor espera, descargando el juego desde la CDN de Roblox..."
  },
  "โปรดรอสักครู่ ระบบกำลังดาวน์โหลดตัวเกมจาก Roblox CDN": {
    "en": "Please wait, downloading client from Roblox CDN",
    "ja": "お待ちください。Roblox CDN からクライアントをダウンロード中",
    "zh": "请稍候，正在从 Roblox CDN 下载游戏客户端",
    "ko": "잠시만 기다려주세요. Roblox CDN에서 클라이언트를 다운로드하는 중",
    "es": "Por favor espera, descargando el juego desde la CDN de Roblox"
  },
  "โปรไฟล์": {
    "en": "Profile",
    "ja": "プロファイル",
    "zh": "配置文件",
    "ko": "프로필",
    "es": "Perfil"
  },
  "โปรไฟล์: {0}": {
    "en": "Profile: {0}",
    "ja": "プロファイル: {0}",
    "zh": "配置文件: {0}",
    "ko": "프로필: {0}",
    "es": "Perfil: {0}"
  },
  "โปรไฟล์การตั้งค่าสำเร็จรูป (Preset Profiles)": {
    "en": "Preset Profiles",
    "ja": "プリセットプロファイル (Preset Profiles)",
    "zh": "预设配置文件 (Preset Profiles)",
    "ko": "프리셋 프로필 (Preset Profiles)",
    "es": "Perfiles predefinidos"
  },
  "โปรไฟล์กำหนดเอง (Custom Profiles)": {
    "en": "Custom Profiles",
    "ja": "カスタムプロファイル (Custom Profiles)",
    "zh": "自定义配置文件 (Custom Profiles)",
    "ko": "사용자 정의 프로필 (Custom Profiles)",
    "es": "Perfiles personalizados"
  },
  "โปรไฟล์นี้เป็น Built-in หากต้องการบันทึกกรุณาระบุชื่อโปรไฟล์ใหม่ (Custom Profile)": {
    "en": "This is a built-in profile. Enter a new name to save as a Custom Profile.",
    "ja": "ビルトインプロファイルです。保存するには新しいプロファイル名を入力してください。",
    "zh": "此为内置配置文件。如需保存，请指定新的配置文件名称。",
    "ko": "내장 프로필입니다. 저장하려면 새 프로필 이름을 입력하세요.",
    "es": "Este perfil es integrado. Introduce un nombre para guardarlo como personalizado."
  },
  "โปรไฟล์นี้เป็น Built-in หากต้องการบันทึกกรุณาระบุชื่อโปรไฟล์ใหม่ (Custom Profile):": {
    "en": "This is a Built-in profile. To save, enter a new Custom Profile name:",
    "ja": "これはBuilt-inプロファイルです。保存するには新しいカスタムプロファイル名を入力してください:",
    "zh": "此为内置配置文件。若要保存，请输入新的自定义配置文件名称:",
    "ko": "이 프로필은 기본 프로필입니다. 저장하려면 새 사용자 지정 프로필 이름을 입력하세요:",
    "es": "Este perfil es predeterminado. Para guardar, introduce un nuevo nombre de perfil:"
  },
  "โปรไฟล์สำเร็จรูป: สามารถแก้ไขและกด \"บันทึกและปรับใช้ทันที\" ได้โดยตรง": {
    "en": "Preset Profile: You can edit and click \"Save & Apply Now\" directly",
    "ja": "プリセットプロファイル: 直接編集して「保存して即座に適用」できます",
    "zh": "预设配置文件: 可直接修改并点击“立即保存并应用”",
    "ko": "프리셋 프로필: 직접 수정 후 \"지금 저장하고 적용\"을 클릭할 수 있습니다",
    "es": "Perfil predefinido: puedes editar y pulsar \"Guardar y aplicar ahora\""
  },
  "ไปข้างหน้า (Forward)": {
    "en": "Forward",
    "ja": "前進 (Forward)",
    "zh": "向前 (Forward)",
    "ko": "앞으로 (Forward)",
    "es": "Adelante"
  },
  "ไปยัง Roblox แล้ว": {
    "en": "applied to Roblox",
    "ja": "Roblox に適用完了",
    "zh": "已应用到 Roblox",
    "ko": "Roblox에 적용됨",
    "es": "aplicado a Roblox"
  },
  "ผลลัพธ์": {
    "en": "Output",
    "ja": "出力",
    "zh": "输出",
    "ko": "결과",
    "es": "Resultado"
  },
  "ผิดพลาด": {
    "en": "Error",
    "ja": "エラー",
    "zh": "错误",
    "ko": "오류",
    "es": "Error"
  },
  "(ผู้เล่น)": {
    "en": "(Players)",
    "ja": "(プレイヤー)",
    "zh": "(玩家)",
    "ko": "(플레이어)",
    "es": "(Jugadores)"
  },
  "(ผู้เล่น": {
    "en": "(Players",
    "ja": "(プレイヤー",
    "zh": "(玩家",
    "ko": "(플레이어",
    "es": "(Jugadores"
  },
  "พรีเซ็ตจัดจอ:": {
    "en": "Layout Presets:",
    "ja": "配置プリセット:",
    "zh": "布局预设:",
    "ko": "레이아웃 프리셋:",
    "es": "Ajustes predefinidos:"
  },
  "พรีเซ็ตจัดจอ": {
    "en": "Layout Presets",
    "ja": "配置プリセット",
    "zh": "布局预设",
    "ko": "레이아웃 프리셋",
    "es": "Ajustes predefinidos"
  },
  "พรีวิว: มืด (Discord Dark)": {
    "en": "Preview: Dark (Discord Dark)",
    "ja": "プレビュー: ダーク (Discord Dark)",
    "zh": "预览: 深色 (Discord Dark)",
    "ko": "미리보기: 어두움 (Discord Dark)",
    "es": "Vista previa: Oscuro (Discord Dark)"
  },
  "พรีวิว: สว่าง (Discord Light)": {
    "en": "Preview: Light (Discord Light)",
    "ja": "プレビュー: ライト (Discord Light)",
    "zh": "预览: 浅色 (Discord Light)",
    "ko": "미리보기: 밝음 (Discord Light)",
    "es": "Vista previa: Claro (Discord Light)"
  },
  "พรีวิว: อัตโนมัติ": {
    "en": "Preview: Auto",
    "ja": "プレビュー: 自動",
    "zh": "预览: 自动",
    "ko": "미리보기: 자동",
    "es": "Vista previa: Auto"
  },
  "พาธโปรแกรมที่กำหนดเอง (.exe):": {
    "en": "Custom Program Path (.exe):",
    "ja": "カスタムプログラムパス (.exe):",
    "zh": "自定义程序路径 (.exe):",
    "ko": "사용자 지정 프로그램 경로 (.exe):",
    "es": "Ruta de programa personalizada (.exe):"
  },
  "พาธโปรแกรมที่กำหนดเอง (.exe)": {
    "en": "Custom Program Path (.exe)",
    "ja": "カスタムプログラムパス (.exe)",
    "zh": "自定义程序路径 (.exe)",
    "ko": "사용자 지정 프로그램 경로 (.exe)",
    "es": "Ruta de programa personalizada (.exe)"
  },
  "พิกัดและขนาดรายบัญชี": {
    "en": "Account Coordinates & Size",
    "ja": "アカウントごとの座標とサイズ",
    "zh": "每个账户的坐标与尺寸",
    "ko": "계정별 좌표 및 크기",
    "es": "Coordenadas y tamaño de la cuenta"
  },
  "พิกัดและขนาดหน้าต่างตอนเปิดเกม": {
    "en": "Window Coordinates & Size at Launch",
    "ja": "ゲーム起動時のウィンドウ座標とサイズ",
    "zh": "启动游戏时的窗口坐标及大小",
    "ko": "게임 실행 시 창 좌표 및 크기",
    "es": "Coordenadas y tamaño de ventana al iniciar"
  },
  "พิกัด X": {
    "en": "X Coordinate",
    "ja": "X 座標",
    "zh": "X 坐标",
    "ko": "X 좌표",
    "es": "Coordenada X"
  },
  "พิกัด Y": {
    "en": "Y Coordinate",
    "ja": "Y 座標",
    "zh": "Y 坐标",
    "ko": "Y 좌표",
    "es": "Coordenada Y"
  },
  "เพิ่ม": {
    "en": "Add",
    "ja": "追加",
    "zh": "添加",
    "ko": "추가",
    "es": "Añadir"
  },
  "เพิ่ม {0} ลงในโปรไฟล์แล้ว": {
    "en": "Added {0} to profile",
    "ja": "{0} をプロファイルに追加しました",
    "zh": "已添加 {0} 到配置文件",
    "ko": "{0}을(를) 프로필에 추가했습니다",
    "es": "{0} añadido al perfil"
  },
  "เพิ่ม {0} ลงใน ClientAppSettings แล้ว": {
    "en": "Added {0} to ClientAppSettings",
    "ja": "{0} をClientAppSettingsに追加しました",
    "zh": "已添加 {0} 到 ClientAppSettings",
    "ko": "{0}을(를) ClientAppSettings에 추가했습니다",
    "es": "{0} añadido a ClientAppSettings"
  },
  "เพิ่มความคมชัดและเรียบเนียนของขอบวัตถุ 3D": {
    "en": "Improves sharpness and smoothness of 3D object edges",
    "ja": "3D オブジェクトの輪郭の鮮明さと滑らかさを向上",
    "zh": "提升 3D 物体边缘的平滑度与清晰度",
    "ko": "3D 오브젝트 외곽선의 선명도와 부드러움을 향상",
    "es": "Mejora la nitidez y suavidad de los bordes 3D"
  },
  "เพิ่มบัญชี": {
    "en": "Add Account",
    "ja": "アカウントを追加",
    "zh": "添加账户",
    "ko": "계정 추가",
    "es": "Añadir cuenta"
  },
  "เพิ่มบัญชีในระบบเพื่อจัดระเบียบหน้าต่างเกมแบบ Multi-Roblox": {
    "en": "Add accounts to organize Multi-Roblox game windows",
    "ja": "アカウントを追加してMulti-Robloxゲームウィンドウを整理します",
    "zh": "在系统中添加账户以组织 Multi-Roblox 游戏窗口",
    "ko": "Multi-Roblox 게임 창을 정리하려면 시스템에 계정을 추가하세요",
    "es": "Añade cuentas para organizar las ventanas de Multi-Roblox"
  },
  "เพิ่มบัญชีใหม่": {
    "en": "Add New Account",
    "ja": "新しいアカウントを追加",
    "zh": "添加新账户",
    "ko": "새 계정 추가",
    "es": "Añadir nueva cuenta"
  },
  "เพิ่มประสิทธิภาพการอัปเดต CFrame (Optimize CFrame Updates)": {
    "en": "Optimize CFrame Updates",
    "ja": "CFrame 更新の最適化 (Optimize CFrame)",
    "zh": "优化 CFrame 坐标更新性能 (Optimize CFrame)",
    "ko": "CFrame 업데이트 성능 최적화 (Optimize CFrame)",
    "es": "Optimizar actualizaciones de CFrame"
  },
  "เพิ่มไม่สำเร็จ": {
    "en": "Failed to add",
    "ja": "追加に失敗しました",
    "zh": "添加失败",
    "ko": "추가 실패",
    "es": "Error al añadir"
  },
  "เพิ่มไม่สำเร็จ:": {
    "en": "Failed to add:",
    "ja": "追加に失敗:",
    "zh": "添加失败:",
    "ko": "추가 실패:",
    "es": "Error al agregar:"
  },
  "เพิ่มเสียงกำหนดเอง": {
    "en": "Add Custom Audio",
    "ja": "カスタム音声を追加",
    "zh": "添加自定义音频",
    "ko": "사용자 지정 오디오 추가",
    "es": "Añadir audio personalizado"
  },
  "เพิ่มใหม่": {
    "en": "Add New",
    "ja": "新規追加",
    "zh": "新增",
    "ko": "새로 추가",
    "es": "Añadir nuevo"
  },
  "เพิ่ม FastFlag": {
    "en": "Add FastFlag",
    "ja": "FastFlag を追加",
    "zh": "添加 FastFlag",
    "ko": "FastFlag 추가",
    "es": "Añadir FastFlag"
  },
  "เพิ่ม FastFlag {0} สำเร็จแล้ว": {
    "en": "Added FastFlag {0} successfully",
    "ja": "FastFlag {0} を追加しました",
    "zh": "成功添加 FastFlag {0}",
    "ko": "FastFlag {0} 추가 성공",
    "es": "FastFlag {0} añadido con éxito"
  },
  "เพิ่ม FastFlag ใหม่": {
    "en": "Add New FastFlag",
    "ja": "新規 FastFlag を追加",
    "zh": "添加新 FastFlag",
    "ko": "새 FastFlag 추가",
    "es": "Añadir nuevo FastFlag"
  },
  "เพิ่ม Flag": {
    "en": "Add Flag",
    "ja": "Flag を追加",
    "zh": "添加 Flag",
    "ko": "Flag 추가",
    "es": "Añadir Flag"
  },
  "เพิ่ม Flag ล้มเหลว": {
    "en": "Failed to add Flag",
    "ja": "Flag の追加に失敗しました",
    "zh": "添加 Flag 失败",
    "ko": "Flag 추가 실패",
    "es": "Error al añadir Flag"
  },
  "เพิ่ม Flag ล้มเหลว:": {
    "en": "Failed to add flag:",
    "ja": "Flagの追加に失敗:",
    "zh": "添加 Flag 失败:",
    "ko": "Flag 추가 실패:",
    "es": "Error al agregar flag:"
  },
  "เพื่อส่งค่ากราฟิกไปยังอินสแตนซ์ที่เปิดอยู่แล้ว หมายเหตุ: ตอนนี้ Roblox บล็อกการจำกัด FPS ผ่าน Fast Flags อยู่ - ให้ใช้เมนูการตั้งค่าในเกมเพื่อเปลี่ยน FPS cap": {
    "en": "To send graphics settings to running instances. Note: Roblox currently restricts FPS capping via Fast Flags; use in-game settings to change FPS cap.",
    "ja": "起動中インスタンスにグラフィック設定を反映。注意: 現在 Roblox は Fast Flags による FPS 制限をブロックしているため、ゲーム内設定をご利用ください。",
    "zh": "用于向运行中的实例应用画质。注意: Roblox 当前限制了通过 Fast Flags 限制 FPS，请使用游戏内设置更改 FPS 上限。",
    "ko": "실행 중인 인스턴스에 그래픽 설정을 전송합니다. 참고: 현재 Roblox는 Fast Flags를 통한 FPS 제한을 차단하므로 게임 내 메뉴를 사용하세요.",
    "es": "Para aplicar ajustes gráficos a instancias abiertas. Nota: Roblox bloquea el límite de FPS por Fast Flags; usa el menú del juego."
  },
  "โพรไฟล์เสียง": {
    "en": "Audio Profile",
    "ja": "オーディオプロファイル",
    "zh": "音频配置文件",
    "ko": "오디오 프로필",
    "es": "Perfil de audio"
  },
  "ฟรี": {
    "en": "Free",
    "ja": "無料",
    "zh": "免费",
    "ko": "무료",
    "es": "Gratis"
  },
  "แฟลกด่วน": {
    "en": "Quick Flags",
    "ja": "クイックフラグ",
    "zh": "快捷 Flags",
    "ko": "빠른 플래그",
    "es": "Flags rápidos"
  },
  "โฟลเดอร์ Bloxstrap": {
    "en": "Bloxstrap Folder",
    "ja": "Bloxstrap フォルダ",
    "zh": "Bloxstrap 文件夹",
    "ko": "Bloxstrap 폴더",
    "es": "Carpeta de Bloxstrap"
  },
  "โฟลเดอร์ ClientSettings": {
    "en": "ClientSettings Folder",
    "ja": "ClientSettings フォルダ",
    "zh": "ClientSettings 文件夹",
    "ko": "ClientSettings 폴더",
    "es": "Carpeta ClientSettings"
  },
  "โฟลเดอร์ Voidstrap": {
    "en": "Voidstrap Folder",
    "ja": "Voidstrap フォルダ",
    "zh": "Voidstrap 文件夹",
    "ko": "Voidstrap 폴더",
    "es": "Carpeta de Voidstrap"
  },
  "ไฟล์": {
    "en": "Files",
    "ja": "ファイル",
    "zh": "文件",
    "ko": "파일",
    "es": "Archivos"
  },
  "ไฟล์)": {
    "en": "files)",
    "ja": "ファイル)",
    "zh": "个文件)",
    "ko": "개 파일)",
    "es": "archivos)"
  },
  "ไฟล์เคอร์เซอร์:": {
    "en": "Cursor file:",
    "ja": "カーソルファイル:",
    "zh": "鼠标指针文件:",
    "ko": "커서 파일:",
    "es": "Archivo de cursor:"
  },
  "ไฟล์เคอร์เซอร์": {
    "en": "Cursor File",
    "ja": "カーソルファイル",
    "zh": "鼠标指针文件",
    "ko": "커서 파일",
    "es": "Archivo de cursor"
  },
  "ไฟล์เสียงปัจจุบัน:": {
    "en": "Current audio file:",
    "ja": "現在の音声ファイル:",
    "zh": "当前音频文件:",
    "ko": "현재 오디오 파일:",
    "es": "Archivo de audio actual:"
  },
  "ไฟล์เสียงปัจจุบัน": {
    "en": "Current audio file",
    "ja": "現在の音声ファイル",
    "zh": "当前音频文件",
    "ko": "현재 오디오 파일",
    "es": "Archivo de audio actual"
  },
  "ภาพสวยสมจริง พร้อมระบบแสง Future Is Bright": {
    "en": "Realistic graphics with Future Is Bright lighting",
    "ja": "Future Is Bright ライティングによるリアルで美麗なグラフィック",
    "zh": "逼真画质，搭载 Future Is Bright 真实动态光影",
    "ko": "Future Is Bright 조명 시스템으로 사실적이고 아름다운 그래픽",
    "es": "Gráficos realistas con iluminación Future Is Bright"
  },
  "ภาษา": {
    "en": "Language",
    "ja": "言語",
    "zh": "语言",
    "ko": "언어",
    "es": "Idioma"
  },
  "ภาษาเกาหลี": {
    "en": "Korean",
    "ja": "韓国語",
    "zh": "韩语",
    "ko": "한국어",
    "es": "Coreano"
  },
  "ภาษาของแอป": {
    "en": "App Language",
    "ja": "アプリ言語",
    "zh": "软件语言",
    "ko": "앱 언어",
    "es": "Idioma de the app"
  },
  "ภาษาจีน": {
    "en": "Chinese",
    "ja": "中国語",
    "zh": "中文",
    "ko": "중국어",
    "es": "Chino"
  },
  "ภาษาญี่ปุ่น": {
    "en": "Japanese",
    "ja": "日本語",
    "zh": "日语",
    "ko": "일본어",
    "es": "Japonés"
  },
  "ภาษาเริ่มต้นของโปรแกรม": {
    "en": "Default app language",
    "ja": "アプリのデフォルト言語",
    "zh": "程序默认语言",
    "ko": "프로그램 기본 언어",
    "es": "Idioma predeterminado de la aplicación"
  },
  "ภาษาสเปน": {
    "en": "Spanish",
    "ja": "スペイン語",
    "zh": "西班牙语",
    "ko": "스페인어",
    "es": "Español"
  },
  "ภาษาหลักที่มีให้เลือกใน Settings": {
    "en": "Main languages available in Settings",
    "ja": "設定で選択可能な主な言語",
    "zh": "可在设置中选择的主要语言",
    "ko": "설정에서 선택할 수 있는 기본 언어들",
    "es": "Idiomas principales disponibles"
  },
  "มหาสมุทร": {
    "en": "Ocean Blue",
    "ja": "オーシャンブルー",
    "zh": "海洋蓝",
    "ko": "오션 블루",
    "es": "Azul océano"
  },
  "มาตรฐาน": {
    "en": "Standard",
    "ja": "標準",
    "zh": "标准",
    "ko": "표준",
    "es": "Estándar"
  },
  "มืด": {
    "en": "Dark",
    "ja": "ダーク",
    "zh": "深色",
    "ko": "어두움",
    "es": "Oscuro"
  },
  "มุมมองตาราง": {
    "en": "Grid View",
    "ja": "グリッド表示",
    "zh": "网格视图",
    "ko": "그리드 보기",
    "es": "Vista de cuadrícula"
  },
  "มุมมองรายการ": {
    "en": "List View",
    "ja": "リスト表示",
    "zh": "列表视图",
    "ko": "목록 보기",
    "es": "Vista de lista"
  },
  "เมาส์ปัจจุบัน 2021 (Roblox Modern)": {
    "en": "Current Mouse 2021 (Roblox Modern)",
    "ja": "現在のマウス 2021 (Roblox Modern)",
    "zh": "当前鼠标 2021 (Roblox Modern)",
    "ko": "현재 마우스 2021 (Roblox Modern)",
    "es": "Ratón actual 2021 (Roblox Modern)"
  },
  "เมาส์ปี 2013 (Classic Arrow)": {
    "en": "Classic 2013 Mouse (Classic Arrow)",
    "ja": "2013年クラシック矢印マウス",
    "zh": "2013 经典箭头鼠标指针",
    "ko": "2013 클래식 화살표 마우스",
    "es": "Ratón clásico de 2013 (Flecha clásica)"
  },
  "เมื่อกี้": {
    "en": "just now",
    "ja": "たった今",
    "zh": "刚刚",
    "ko": "방금",
    "es": "hace un momento"
  },
  "เมื่อตั้งรหัสผ่าน จะต้องใส่รหัสผ่านทุกครั้งที่เปิดโปรแกรมก่อนเข้าถึงข้อมูลและบัญชี": {
    "en": "Master password required on each application launch before accessing accounts",
    "ja": "マスターパスワードを設定すると、起動ごとにパスワード入力が必要になります",
    "zh": "设置主密码后，每次启动程序访问数据和账户前都必须输入密码",
    "ko": "마스터 비밀번호를 설정하면 앱을 실행할 때마다 비밀번호를 입력해야 합니다",
    "es": "Al configurar contraseña maestra, deberás introducirla al abrir el programa"
  },
  "เมื่อเพิ่มบัญชีแล้ว คุณสามารถกำหนดพิกัด X, Y และความกว้าง ยาว หรือใช้ Preset จัดหน้าจออัตโนมัติได้ทันที": {
    "en": "Once accounts are added, you can set X, Y coordinates and dimensions or use auto-grid presets immediately.",
    "ja": "アカウントを追加すると、X, Y座標と幅・高さを設定したり、プリセットで自動整列できます。",
    "zh": "添加账户后，您可以立即配置 X、Y 坐标和宽高，或使用预设自动排列窗口。",
    "ko": "계정을 추가하면 X, Y 좌표 및 너비와 높이를 지정하거나 프리셋으로 자동 정렬할 수 있습니다.",
    "es": "Al añadir cuentas, podrás configurar coordenadas X, Y y dimensiones o usar ajustes automáticos."
  },
  "เมื่อเร็วๆ นี้": {
    "en": "Recently",
    "ja": "最近",
    "zh": "最近",
    "ko": "최근",
    "es": "Recientemente"
  },
  "แมพที่เล่นล่าสุด / เล่นบ่อย": {
    "en": "Recent / Favorite Maps",
    "ja": "最近のプレイ/お気に入り",
    "zh": "最近玩过/最爱地图",
    "ko": "최근 플레이/즐겨찾기",
    "es": "Mapas recientes / favoritos"
  },
  "ไม่จำกัด": {
    "en": "Unlimited",
    "ja": "無制限",
    "zh": "无限制",
    "ko": "무제한",
    "es": "Ilimitado"
  },
  "ไม่ได้ตั้งรหัสผ่าน (Disabled)": {
    "en": "No password set (Disabled)",
    "ja": "パスワード未設定 (無効)",
    "zh": "未设置密码 (已停用)",
    "ko": "비밀번호 미설정 (비활성화)",
    "es": "Sin contraseña (Desactivado)"
  },
  "ไม่ได้ระบุรหัส Hash ของเวอร์ชัน": {
    "en": "No version hash specified",
    "ja": "バージョン Hash が指定されていません",
    "zh": "未指定版本的 Hash 代码",
    "ko": "버전 Hash 코드가 지정되지 않았습니다",
    "es": "No se ha especificado el Hash de la versión"
  },
  "ไม่ได้รัน": {
    "en": "Idle",
    "ja": "未起動",
    "zh": "未运行",
    "ko": "대기 중",
    "es": "Inactivo"
  },
  "ไม่ทราบ": {
    "en": "Unknown",
    "ja": "不明",
    "zh": "未知",
    "ko": "알 수 없음",
    "es": "Desconocido"
  },
  "ไม่ทราบชื่อ": {
    "en": "Unknown Name",
    "ja": "Unknown Name",
    "zh": "未知用户名",
    "ko": "알 수 없는 이름",
    "es": "Nombre desconocido"
  },
  "ไม่พบ": {
    "en": "Not found",
    "ja": "見つかりません",
    "zh": "未找到",
    "ko": "찾을 수 없음",
    "es": "No encontrado"
  },
  "ไม่พบการติดตั้ง": {
    "en": "No installation found",
    "ja": "インストールが見つかりません",
    "zh": "未找到安装",
    "ko": "설치를 찾을 수 없습니다",
    "es": "No se encontró instalación"
  },
  "ไม่พบข้อมูลแมพ (Invalid Place ID)": {
    "en": "Map info not found (Invalid Place ID)",
    "ja": "マップ情報が見つかりません (無効な Place ID)",
    "zh": "未找到地图信息 (无效的 Place ID)",
    "ko": "맵 정보를 찾을 수 없습니다 (유효하지 않은 Place ID)",
    "es": "No se encontró información del mapa (Place ID no válido)"
  },
  "ไม่พบคุกกี้บัญชี": {
    "en": "No account cookie found",
    "ja": "アカウントのクッキーが見つかりません",
    "zh": "未找到账户 Cookie",
    "ko": "계정 쿠키를 찾을 수 없습니다",
    "es": "No se encontró la cookie de la cuenta"
  },
  "ไม่พบคุกกี้ Roblox ในข้อความที่วาง": {
    "en": "No Roblox cookie found in pasted text",
    "ja": "貼り付けられたテキストにRobloxクッキーが見つかりません",
    "zh": "粘贴的文本中未找到 Roblox Cookie",
    "ko": "붙여넣은 텍스트에서 Roblox 쿠키를 찾을 수 없습니다",
    "es": "No se encontró cookie de Roblox en el texto pegado"
  },
  "ไม่พบเซิร์ฟเวอร์ที่ตรงตามเงื่อนไข": {
    "en": "No server matched conditions",
    "ja": "条件に一致するサーバーが見つかりませんでした",
    "zh": "未找到符合条件的服务器",
    "ko": "조건에 맞는 서버를 찾지 못했습니다",
    "es": "No se encontró un servidor que coincida con las condiciones"
  },
  "ไม่พบเซิร์ฟเวอร์ที่ตรงตามเงื่อนไข {0} สำหรับ {1} บัญชี, รันในโหมดจับคู่ปกติ": {
    "en": "No server matched condition {0} for {1} accounts; joining normal matchmaking",
    "ja": "{1} 個のアカウントに対して条件 {0} に一致するサーバーが見つかりません。通常マッチングで参加します。",
    "zh": "未为 {1} 个账户找到符合条件 {0} 的服务器，正在通过普通匹配运行",
    "ko": "{1}개 계정에 대해 조건 {0}에 맞는 서버가 없어 일반 매칭으로 실행합니다",
    "es": "No se encontró servidor con condición {0} para {1} cuentas; usando emparejamiento normal"
  },
  "ไม่พบเซิร์ฟเวอร์ที่เหมาะสม ใช้การเชื่อมต่อปกติ": {
    "en": "No suitable server found, using normal join",
    "ja": "適切なサーバーが見つかりません。通常接続を使用します",
    "zh": "未找到合适服务器，使用普通连接",
    "ko": "적절한 서버를 찾지 못했습니다. 일반 연결을 사용합니다",
    "es": "No se encontró un servidor adecuado, usando conexión normal"
  },
  "ไม่พบไดเรกทอรี Roblox": {
    "en": "Roblox directory not found",
    "ja": "Roblox ディレクトリが見つかりません",
    "zh": "未找到 Roblox 目录",
    "ko": "Roblox 디렉터리를 찾을 수 없습니다",
    "es": "Directorio de Roblox no encontrado"
  },
  "ไม่พบเนื้อหาโค้ดสคริปต์": {
    "en": "No script code content found",
    "ja": "スクリプトのコード内容が見つかりません",
    "zh": "未找到脚本代码内容",
    "ko": "스크립트 코드 내용을 찾을 수 없습니다",
    "es": "No se encontró el código del script"
  },
  "ไม่พบบิลด์ในระบบ CDN (HTTP)": {
    "en": "Build not found on CDN (HTTP)",
    "ja": "CDN 上にビルドが見つかりません (HTTP)",
    "zh": "CDN 上未找到该构建 (HTTP)",
    "ko": "CDN에서 빌드를 찾을 수 없습니다 (HTTP)",
    "es": "Build no encontrada en la CDN (HTTP)"
  },
  "ไม่พบบิลด์ในระบบ CDN (HTTP": {
    "en": "Build not found on CDN (HTTP",
    "ja": "CDN 上にビルドが見つかりません (HTTP",
    "zh": "CDN 上未找到该构建 (HTTP",
    "ko": "CDN에서 빌드를 찾을 수 없습니다 (HTTP",
    "es": "Build no encontrada en la CDN (HTTP"
  },
  "ไม่พบบิลด์ในระบบ CDN (HTTP {0})": {
    "en": "Build not found on CDN (HTTP {0})",
    "ja": "CDN 上にビルドが見つかりません (HTTP {0})",
    "zh": "CDN 上未找到该构建版本 (HTTP {0})",
    "ko": "CDN에서 해당 빌드를 찾을 수 없습니다 (HTTP {0})",
    "es": "Build no encontrada en la CDN (HTTP {0})"
  },
  "ไม่พบโปรไฟล์ที่ต้องการ": {
    "en": "Target profile not found",
    "ja": "指定されたプロファイルが見つかりません",
    "zh": "未找到目标配置文件",
    "ko": "해당 프로필을 찾을 수 없습니다",
    "es": "Perfil no encontrado"
  },
  "ไม่พบโปรไฟล์นี้": {
    "en": "This profile was not found",
    "ja": "このプロファイルは見つかりません",
    "zh": "未找到该配置文件",
    "ko": "이 프로필을 찾을 수 없습니다",
    "es": "No se encontró este perfil"
  },
  "ไม่พบรายการที่ตรงกัน": {
    "en": "No matching entries found",
    "ja": "一致する項目が見つかりません",
    "zh": "未找到匹配项",
    "ko": "일치하는 항목을 찾을 수 없습니다",
    "es": "No se encontraron coincidencias"
  },
  "ไม่พบสคริปต์ที่ตรงกับ": {
    "en": "No scripts matched",
    "ja": "一致するスクリプトが見つかりませんでした",
    "zh": "未找到匹配的脚本",
    "ko": "일치하는 스크립트가 없습니다",
    "es": "No se encontraron scripts coincidentes"
  },
  "ไม่พบสคริปต์ที่ตรงกับ \"": {
    "en": "No scripts matched \"",
    "ja": "一致するスクリプトが見つかりませんでした \"",
    "zh": "未找到匹配的脚本 \"",
    "ko": "일치하는 스크립트가 없습니다 \"",
    "es": "No se encontraron scripts coincidentes con \""
  },
  "ไม่พบสคริปต์ที่ตรงกับ \"{0}\"": {
    "en": "No scripts found matching \"{0}\"",
    "ja": "「{0}」に一致するスクリプトが見つかりません",
    "zh": "未找到与“{0}”匹配的脚本",
    "ko": "\"{0}\"과(와) 일치하는 스크립트를 찾을 수 없습니다",
    "es": "No se encontraron scripts que coincidan con \"{0}\""
  },
  "ไม่พบสคริปต์ในขณะนี้": {
    "en": "No scripts found at this time",
    "ja": "現在スクリプトが見つかりません",
    "zh": "暂未找到脚本",
    "ko": "현재 스크립트가 없습니다",
    "es": "No se encontraron scripts en este momento"
  },
  "ไม่พบหน้าต่าง Roblox ที่กำลังรันสำหรับบัญชีนี้": {
    "en": "No running Roblox window found for this account",
    "ja": "このアカウントの実行中 Roblox ウィンドウが見つかりません",
    "zh": "未找到此账户正在运行的 Roblox 窗口",
    "ko": "이 계정으로 실행 중인 Roblox 창을 찾을 수 없습니다",
    "es": "No se encontró ventana de Roblox en ejecución para esta cuenta"
  },
  "ไม่พบหน้าต่าง Roblox ที่เปิดทำงานของบัญชีนี้ (ต้องเปิดเกมทิ้งไว้ก่อน)": {
    "en": "No active Roblox window found for this account (game must be running)",
    "ja": "このアカウントのアクティブな Roblox ウィンドウがありません (ゲームを起動してください)",
    "zh": "未找到此账户活动的 Roblox 窗口 (请先运行游戏)",
    "ko": "이 계정의 실행 중인 Roblox 창이 없습니다 (먼저 게임을 실행해 두세요)",
    "es": "No hay ventana activa para esta cuenta (el juego debe estar abierto)"
  },
  "ไม่พบหน้าต่าง Roblox ที่เปิดทำงานอยู่ หรือระบบขัดข้อง": {
    "en": "No active Roblox windows found or system error occurred",
    "ja": "アクティブな Roblox ウィンドウが見つからないかシステムエラーが発生しました",
    "zh": "未找到活动的 Roblox 窗口或系统遇到故障",
    "ko": "실행 중인 Roblox 창을 찾을 수 없거나 시스템 오류가 발생했습니다",
    "es": "No se encontraron ventanas activas o hubo un error del sistema"
  },
  "ไม่พบ FastFlag ที่ค้นหา": {
    "en": "No FastFlags found matching search",
    "ja": "一致するFastFlagが見つかりません",
    "zh": "未找到匹配的 FastFlag",
    "ko": "일치하는 FastFlag를 찾을 수 없습니다",
    "es": "No se encontraron FastFlags coincidentes"
  },
  "ไม่พบ FastFlag ที่ตรงกับการค้นหา": {
    "en": "No FastFlags matching search",
    "ja": "検索に一致するFastFlagがありません",
    "zh": "未找到与搜索匹配的 FastFlag",
    "ko": "검색과 일치하는 FastFlag가 없습니다",
    "es": "No hay FastFlags que coincidan con la búsqueda"
  },
  "ไม่พบ GlobalBasicSettings_13.xml - เปิด Roblox หนึ่งครั้งเพื่อสร้างไฟล์นี้ก่อน": {
    "en": "GlobalBasicSettings_13.xml not found. Launch Roblox once to generate it.",
    "ja": "GlobalBasicSettings_13.xml が見つかりません。一度 Roblox を起動して作成してください。",
    "zh": "未找到 GlobalBasicSettings_13.xml。请先启动一次 Roblox 以生成此文件。",
    "ko": "GlobalBasicSettings_13.xml을 찾을 수 없습니다. 한 번 Roblox를 실행하여 생성하세요.",
    "es": "No se encontró GlobalBasicSettings_13.xml. Abre Roblox una vez para crearlo."
  },
  "ไม่พบ Place ID ใน URL": {
    "en": "No Place ID found in URL",
    "ja": "URL に Place ID が見つかりません",
    "zh": "URL 中未找到 Place ID",
    "ko": "URL에서 Place ID를 찾을 수 없습니다",
    "es": "No se encontró Place ID en la URL"
  },
  "ไม่พบ Voidstrap (ใช้ Roblox โหมดปกติ)": {
    "en": "Voidstrap not found (Running Roblox in Standard Mode)",
    "ja": "Voidstrap が見つかりません (Roblox 通常モードで実行)",
    "zh": "未找到 Voidstrap (使用 Roblox 标准模式运行)",
    "ko": "Voidstrap을 찾을 수 없습니다 (Roblox 일반 모드로 실행)",
    "es": "No se encontró Voidstrap (usando Roblox en modo estándar)"
  },
  "ไม่พร้อมใช้งาน": {
    "en": "Unavailable",
    "ja": "利用不可",
    "zh": "不可用",
    "ko": "사용 불가",
    "es": "No disponible"
  },
  "ไม่มี": {
    "en": "None",
    "ja": "なし",
    "zh": "无",
    "ko": "없음",
    "es": "Ninguno"
  },
  "ไม่มีข้อมูลของที่ใส่": {
    "en": "No items equipped info",
    "ja": "装備情報はありません",
    "zh": "暂无装备信息",
    "ko": "장착 정보 없음",
    "es": "No hay información de objetos"
  },
  "ไม่มีข้อมูลประวัติการเล่น": {
    "en": "No play history",
    "ja": "プレイ履歴はありません",
    "zh": "暂无玩过记录",
    "ko": "플레이 기록 없음",
    "es": "No hay historial de juego"
  },
  "ไม่มีความหน่วงแบบสุ่ม": {
    "en": "No random jitter",
    "ja": "ランダム待機なし",
    "zh": "无随机延迟",
    "ko": "랜덤 지연 없음",
    "es": "Sin retardo aleatorio"
  },
  "ไม่มีคุกกี้": {
    "en": "No Cookie",
    "ja": "クッキーなし",
    "zh": "无 Cookie",
    "ko": "쿠키 없음",
    "es": "Sin cookie"
  },
  "ไม่มีคุกกี้สำหรับบัญชีนี้": {
    "en": "No cookie found for this account",
    "ja": "このアカウントのクッキーはありません",
    "zh": "未找到此账户的 Cookie",
    "ko": "이 계정의 쿠키를 찾을 수 없습니다",
    "es": "No hay cookie para esta cuenta"
  },
  "ไม่มีชื่อผู้ใช้": {
    "en": "No username",
    "ja": "ユーザー名なし",
    "zh": "无用户名",
    "ko": "사용자 이름 없음",
    "es": "Sin nombre de usuario"
  },
  "ไม่มีบัญชี": {
    "en": "No accounts",
    "ja": "アカウントなし",
    "zh": "无账户",
    "ko": "계정 없음",
    "es": "Sin cuentas"
  },
  "ไม่มีบัญชีที่กำลังเล่นเกม": {
    "en": "No accounts currently playing",
    "ja": "現在プレイ中のアカウントはありません",
    "zh": "当前没有账户正在玩游戏",
    "ko": "현재 게임을 플레이 중인 계정이 없습니다",
    "es": "No hay cuentas jugando en este momento"
  },
  "ไม่มีบัญชีที่ตรงกับการค้นหาหรือตัวกรอง": {
    "en": "No accounts match search or filters",
    "ja": "検索条件やフィルターに一致するアカウントがありません",
    "zh": "没有符合搜索或过滤条件的账户",
    "ko": "검색 또는 필터와 일치하는 계정이 없습니다",
    "es": "Ninguna cuenta coincide con la búsqueda o filtros"
  },
  "ไม่มีโปรเซสที่ติดตามสำหรับบัญชีนี้": {
    "en": "No tracked process for this account",
    "ja": "このアカウントに関連付けられたプロセスはありません",
    "zh": "此账户没有正在跟踪的进程",
    "ko": "이 계정에 대해 추적 중인 프로세스가 없습니다",
    "es": "No hay proceso rastreado para esta cuenta"
  },
  "ไม่มีรหัส": {
    "en": "No User ID",
    "ja": "ユーザーIDなし",
    "zh": "无用户ID",
    "ko": "ID 없음",
    "es": "Sin ID"
  },
  "ไม่มีรหัสผู้ใช้": {
    "en": "No User ID",
    "ja": "ユーザー ID なし",
    "zh": "无用户 ID",
    "ko": "사용자 ID 없음",
    "es": "Sin ID de usuario"
  },
  "ไม่มีรายละเอียดให้คัดลอก": {
    "en": "No details to copy",
    "ja": "コピーする詳細がありません",
    "zh": "没有可复制的详细信息",
    "ko": "복사할 세부 정보가 없습니다",
    "es": "No hay detalles para copiar"
  },
  "ไม่มีเสียงเมื่อตัวละครตาย": {
    "en": "No sound on character death",
    "ja": "キャラクター死亡時の音声なし",
    "zh": "角色死亡时无声音",
    "ko": "캐릭터 사망 시 소리 없음",
    "es": "Sin sonido al morir el personaje"
  },
  "ไม่มี FastFlags ให้ลบ": {
    "en": "No FastFlags to delete",
    "ja": "削除する FastFlags がありません",
    "zh": "没有可删除的 FastFlags",
    "ko": "삭제할 FastFlags가 없습니다",
    "es": "No hay FastFlags para eliminar"
  },
  "ไม่มี native helper": {
    "en": "No native helper available",
    "ja": "ネイティブヘルパーがありません",
    "zh": "无可用原生助手程序",
    "ko": "네이티브 헬퍼가 없습니다",
    "es": "Sin asistente nativo disponible"
  },
  "ไม่ส่งชื่อบัญชีขึ้น Discord เพื่อป้องกันความเป็นส่วนตัว": {
    "en": "Do not send username to Discord to preserve privacy",
    "ja": "プライバシー保護のため Discord にユーザー名を送信しない",
    "zh": "不向 Discord 发送账户名以保护个人隐私",
    "ko": "개인정보 보호를 위해 Discord에 사용자 이름을 전송하지 않음",
    "es": "No enviar nombre de usuario a Discord para proteger la privacidad"
  },
  "ไม่สามารถขอ auth ticket ได้": {
    "en": "Failed to obtain auth ticket",
    "ja": "認証チケットを取得できませんでした",
    "zh": "无法获取认证票据",
    "ko": "인증 티켓을 가져오지 못했습니다",
    "es": "No se pudo obtener el ticket de autenticación"
  },
  "ไม่สามารถขอ CSRF token ได้ คุกกี้ของบัญชียังใช้ได้อยู่หรือไม่": {
    "en": "Unable to get CSRF token. Is this account cookie still valid?",
    "ja": "CSRF トークンを取得できません。クッキーはまだ有効ですか？",
    "zh": "无法获取 CSRF token。此账户的 Cookie 是否仍然有效？",
    "ko": "CSRF 토큰을 가져올 수 없습니다. 이 계정의 쿠키가 아직 유효합니까?",
    "es": "No se pudo obtener el token CSRF. ¿Sigue siendo válida la cookie?"
  },
  "ไม่สามารถขอ CSRF token ได้ (คุกกี้อาจหมดอายุ)": {
    "en": "Unable to get CSRF token (Cookie may be expired)",
    "ja": "CSRF トークンを取得できません (クッキーが期限切れの可能性があります)",
    "zh": "无法获取 CSRF token (Cookie 可能已过期)",
    "ko": "CSRF 토큰을 가져올 수 없습니다 (쿠키 만료 가능성)",
    "es": "No se pudo obtener el token CSRF (la cookie podría estar caducada)"
  },
  "ไม่สามารถจัดรูปแบบได้: รูปแบบ JSON ไม่ถูกต้อง": {
    "en": "Cannot format: Invalid JSON syntax",
    "ja": "整形できません: JSON 構文が無効です",
    "zh": "无法格式化: JSON 语法错误",
    "ko": "정렬할 수 없습니다: 잘못된 JSON 문법",
    "es": "No se puede formatear: sintaxis JSON no válida"
  },
  "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ ScriptBlox ได้": {
    "en": "Unable to connect to ScriptBlox server",
    "ja": "ScriptBloxサーバーに接続できません",
    "zh": "无法连接到 ScriptBlox 服务器",
    "ko": "ScriptBlox 서버에 연결할 수 없습니다",
    "es": "No se puede conectar al servidor de ScriptBlox"
  },
  "ไม่สามารถเชื่อมต่อได้": {
    "en": "Unable to connect",
    "ja": "接続できません",
    "zh": "无法连接",
    "ko": "연결할 수 없습니다",
    "es": "No se puede conectar"
  },
  "ไม่สามารถตั้งคีย์เข้ารหัสได้ กรุณาลองอีกครั้ง": {
    "en": "Failed to set key. Try again.",
    "ja": "キーの設定に失敗しました。再試行してください。",
    "zh": "设置密钥失败。请重试。",
    "ko": "키 설정에 실패했습니다. 다시 시도하십시오.",
    "es": "Error al establecer la clave. Reintente."
  },
  "ไม่สามารถถอดรหัสไฟล์เสียงได้": {
    "en": "Unable to decode audio file",
    "ja": "音声ファイルをデコードできませんでした",
    "zh": "无法解码音频文件",
    "ko": "오디오 파일을 디코딩할 수 없습니다",
    "es": "No se pudo decodificar el archivo de audio"
  },
  "ไม่สามารถบันทึกได้ กรุณาแก้ไข Syntax JSON ให้ถูกต้อง": {
    "en": "Cannot save: Please fix JSON syntax errors",
    "ja": "保存できません: JSON 構文エラーを修正してください",
    "zh": "无法保存: 请更正 JSON 语法错误",
    "ko": "저장할 수 없습니다: JSON 문법 오류를 수정하세요",
    "es": "No se puede guardar: corrige los errores de sintaxis JSON"
  },
  "ไม่สามารถปิดอินสแตนซ์นั้นได้": {
    "en": "Unable to close that instance",
    "ja": "そのインスタンスを終了できませんでした",
    "zh": "无法关闭该实例",
    "ko": "해당 인스턴스를 닫을 수 없습니다",
    "es": "No se pudo cerrar esa instancia"
  },
  "ไม่สามารถเปิดโฟลเดอร์ได้": {
    "en": "Unable to open folder",
    "ja": "フォルダを開けませんでした",
    "zh": "无法打开文件夹",
    "ko": "폴더를 열 수 없습니다",
    "es": "No se puede abrir la carpeta"
  },
  "ไม่สามารถเปิดโฟลเดอร์ได้:": {
    "en": "Cannot open folder:",
    "ja": "フォルダを開けません:",
    "zh": "无法打开文件夹:",
    "ko": "폴더를 열 수 없습니다:",
    "es": "No se puede abrir la carpeta:"
  },
  "ไม่สามารถเปิดหน้าหลักได้ (อาจไม่มีคุกกี้)": {
    "en": "Could not open home page (Cookie may be missing)",
    "ja": "ホームを開けませんでした (クッキーがない可能性があります)",
    "zh": "无法打开主页 (可能缺少 Cookie)",
    "ko": "홈을 열 수 없습니다 (쿠키가 없을 수 있습니다)",
    "es": "No se pudo abrir el inicio (puede faltar la cookie)"
  },
  "ไม่สามารถแปลงลิงก์แชร์ได้ อาจหมดอายุหรือไม่ถูกต้อง": {
    "en": "Unable to resolve share link. It may be expired or invalid.",
    "ja": "共有リンクを解決できません。期限切れまたは無効です。",
    "zh": "无法解析共享链接。链接可能已失效或错误。",
    "ko": "공유 링크를 변환할 수 없습니다. 만료되었거나 유효하지 않습니다.",
    "es": "No se puede resolver el enlace. Puede estar caducado o no ser válido."
  },
  "ไม่สามารถแปลง access code ของ private server ได้ ลิงก์อาจหมดอายุหรือคุณไม่มีสิทธิ์": {
    "en": "Unable to resolve private server access code. Link may be expired or permission denied.",
    "ja": "プライベートサーバーのアクセスコードを解決できません。リンクの期限切れまたは権限がありません。",
    "zh": "无法解析私人服务器访问代码。链接可能已过期或您没有访问权限。",
    "ko": "비공개 서버 액세스 코드를 확인할 수 없습니다. 링크가 만료되었거나 권한이 없습니다.",
    "es": "No se pudo resolver el código del servidor privado. Enlace caducado o sin permisos."
  },
  "ไม่สามารถยกเลิกรหัสผ่านได้": {
    "en": "Failed to remove password",
    "ja": "パスワードの解除に失敗しました",
    "zh": "取消密码失败",
    "ko": "비밀번호 해제 실패",
    "es": "Error al quitar la contraseña"
  },
  "ไม่สามารถยืนยันบัญชีได้ คุกกี้อาจหมดอายุหรือถูกยกเลิก": {
    "en": "Unable to verify account. Cookie may be expired or revoked.",
    "ja": "アカウントを確認できません。クッキーの期限切れまたは失効の可能性があります。",
    "zh": "无法验证账户。Cookie 可能已过期或已被撤销。",
    "ko": "계정을 확인할 수 없습니다. 쿠키가 만료되었거나 취소되었을 수 있습니다.",
    "es": "No se puede verificar la cuenta. La cookie puede estar caducada o revocada."
  },
  "ไม่สามารถรันตัวติดตั้งได้": {
    "en": "Unable to execute installer",
    "ja": "インストーラーを実行できませんでした",
    "zh": "无法运行安装程序",
    "ko": "설치 프로그램을 실행할 수 없습니다",
    "es": "No se puede ejecutar el instalador"
  },
  "ไม่สำเร็จ": {
    "en": "Failed",
    "ja": "失敗",
    "zh": "失败",
    "ko": "실패",
    "es": "Fallido"
  },
  "ไม่สำเร็จ:": {
    "en": "Failed:",
    "ja": "失敗:",
    "zh": "失败:",
    "ko": "실패:",
    "es": "Error:"
  },
  "ไม่แสดงชื่อแมพที่กำลังเล่น และปิดปุ่มกดตามเข้าเกม ป้องกันการโดนตามในเกม": {
    "en": "Hides current map name and disables Join button to prevent stream sniping",
    "ja": "マップ名を非表示にし、参加ボタンを無効化してゲーム内追跡を防止",
    "zh": "隐藏正在游玩的地图名称并关闭“跟随进入游戏”按钮，防止被窥屏跟踪",
    "ko": "플레이 중인 맵 이름을 숨기고 따라오기 버튼을 비활성화하여 저격을 방지합니다",
    "es": "Oculta el nombre del mapa y desactiva el botón de unirse para evitar acoso"
  },
  "ไม่แสดงเวลา (ซ่อนเวลา)": {
    "en": "Hide Timestamps",
    "ja": "タイムスタンプ非表示",
    "zh": "隐藏计时",
    "ko": "시간 숨기기",
    "es": "Ocultar marca de tiempo"
  },
  "ยกเลิก": {
    "en": "Cancel",
    "ja": "Cancel",
    "zh": "取消",
    "ko": "취소",
    "es": "Cancelar"
  },
  "ยกเลิกรหัสผ่าน": {
    "en": "Remove Password",
    "ja": "パスワードを解除",
    "zh": "取消密码",
    "ko": "비밀번호 해제",
    "es": "Quitar contraseña"
  },
  "ยกเลิกรหัสผ่านการล็อกโปรแกรมเรียบร้อยแล้ว": {
    "en": "App lock password removed successfully",
    "ja": "アプリロックパスワードを解除しました",
    "zh": "已成功取消程序锁密码",
    "ko": "앱 잠금 비밀번호가 해제되었습니다",
    "es": "Contraseña de bloqueo eliminada con éxito"
  },
  "ย้อนกลับ (Back)": {
    "en": "Back",
    "ja": "戻る (Back)",
    "zh": "返回 (Back)",
    "ko": "뒤로 (Back)",
    "es": "Atrás"
  },
  "ยอมรับคีย์เข้ารหัสแล้ว - ปลดล็อกบัญชี": {
    "en": "Encryption key accepted - Accounts unlocked",
    "ja": "暗号化キーが承認されました - アカウントがロック解除されました",
    "zh": "加密密钥已验证 - 账户已解锁",
    "ko": "암호화 키가 승인되었습니다 - 계정이 잠금 해제됨",
    "es": "Clave de cifrado aceptada - Cuentas desbloqueadas"
  },
  "ย่อหน้าต่าง": {
    "en": "Minimize Window",
    "ja": "ウィンドウを最小化",
    "zh": "最小化窗口",
    "ko": "창 최소화",
    "es": "Minimizar ventana"
  },
  "ย่อหน้าต่าง Roblox ลงเมื่อรันเสร็จสิ้น": {
    "en": "Minimize Roblox window when launch completes",
    "ja": "起動完了時に Roblox ウィンドウを最小化",
    "zh": "运行完成后自动最小化 Roblox 窗口",
    "ko": "실행 완료 시 Roblox 창 최소화",
    "es": "Minimizar ventana de Roblox tras iniciarse"
  },
  "ยังติด rate limit หลังพยายาม 3 ครั้ง กรุณารอ 30 วินาทีแล้วลองใหม่": {
    "en": "Rate limit hit after 3 attempts. Please wait 30 seconds and retry.",
    "ja": "3回試行後もレート制限中です。30秒待ってから再試行してください。",
    "zh": "尝试 3 次后仍受请求频率限制。请等待 30 秒后重试。",
    "ko": "3회 시도 후에도 요청 제한 상태입니다. 30초 대기 후 다시 시도하세요.",
    "es": "Límite de peticiones alcanzado tras 3 intentos. Espera 30 segundos y reintenta."
  },
  "ยังไม่ได้เลือก": {
    "en": "Not selected",
    "ja": "未選択",
    "zh": "未选择",
    "ko": "선택 안 됨",
    "es": "No seleccionado"
  },
  "ยังไม่เปิด": {
    "en": "Not running",
    "ja": "未起動",
    "zh": "未起動",
    "ko": "대기 중",
    "es": "Inactivo"
  },
  "ยังไม่มีกลุ่ม": {
    "en": "No groups yet",
    "ja": "グループがありません",
    "zh": "暂无群组",
    "ko": "그룹 없음",
    "es": "Sin grupos"
  },
  "ยังไม่มีการตั้งค่า FastFlags": {
    "en": "No FastFlags configured yet",
    "ja": "FastFlagsはまだ設定されていません",
    "zh": "尚未配置 FastFlags",
    "ko": "아직 설정된 FastFlags가 없습니다",
    "es": "Aún no hay FastFlags configurados"
  },
  "ยังไม่มีบัญชีที่บันทึกไว้": {
    "en": "No accounts saved yet",
    "ja": "保存されたアカウントはありません",
    "zh": "暂无保存的账户",
    "ko": "저장된 계정이 없습니다",
    "es": "No hay cuentas guardadas"
  },
  "ยังไม่มีบัญชีที่บันทึกไว้ในระบบ": {
    "en": "No accounts saved in system",
    "ja": "システムに保存されたアカウントはありません",
    "zh": "系统中尚未保存任何账户",
    "ko": "시스템에 저장된 계정이 없습니다",
    "es": "No hay cuentas guardadas en el sistema"
  },
  "ยังไม่มีบัญชีในระบบ": {
    "en": "No accounts in the system",
    "ja": "システムにアカウントがありません",
    "zh": "系统中暂无账户",
    "ko": "시스템에 계정이 없습니다",
    "es": "No hay cuentas en el sistema"
  },
  "ยังไม่มีบัญชีในระบบ โปรดเพิ่มบัญชีก่อน": {
    "en": "No accounts in system. Please add an account first.",
    "ja": "アカウントがありません。まずアカウントを追加してください。",
    "zh": "系统中暂无账户。请先添加账户。",
    "ko": "시스템에 계정이 없습니다. 먼저 계정을 추가하세요.",
    "es": "No hay cuentas en el sistema. Por favor añade una cuenta primero."
  },
  "ยังไม่มีบัญชี เพิ่มจากแท็บบัญชีก่อน": {
    "en": "No accounts yet. Add from Accounts tab first.",
    "ja": "アカウントがまだありません。まず「アカウント」タブから追加してください。",
    "zh": "暂无账户。请先从“账户”标签中添加。",
    "ko": "계정이 없습니다. 먼저 계정 탭from追加하세요.",
    "es": "Aún no hay cuentas. Añade primero desde la pestaña Cuentas."
  },
  "ยังไม่มีบัญชีสำหรับแสดงผลในตารางพรีวิว": {
    "en": "No accounts available for preview grid",
    "ja": "プレビューグリッドに表示するアカウントがありません",
    "zh": "预览网格中暂无可显示账户",
    "ko": "미리보기 그리드에 표시할 계정이 없습니다",
    "es": "No hay cuentas para mostrar en la cuadrícula"
  },
  "ยังไม่มีบันทึก": {
    "en": "No logs yet",
    "ja": "ログはありません",
    "zh": "暂无日志",
    "ko": "기록된 로그가 없습니다",
    "es": "No hay registros todavía"
  },
  "ยังไม่มีโปรไฟล์ที่บันทึกไว้": {
    "en": "No saved profiles yet",
    "ja": "保存されたプロファイルはありません",
    "zh": "暂无保存的配置文件",
    "ko": "저장된 프로필이 없습니다",
    "es": "No hay perfiles guardados"
  },
  "ยังไม่มี FastFlags ในโปรไฟล์นี้": {
    "en": "No FastFlags in this profile yet",
    "ja": "このプロファイルにはまだFastFlagsがありません",
    "zh": "该配置文件中尚无 FastFlags",
    "ko": "이 프로필에 아직 FastFlags가 없습니다",
    "es": "Aún no hay FastFlags en este perfil"
  },
  "ยามเย็น": {
    "en": "Sunset",
    "ja": "サンセット",
    "zh": "日落橙",
    "ko": "석양색",
    "es": "Atardecer"
  },
  "ยืนยัน": {
    "en": "Confirm",
    "ja": "確認",
    "zh": "确认",
    "ko": "확인",
    "es": "Confirmar"
  },
  "ยืนยันการรีเซ็ตรหัสผ่าน? บัญชีทั้งหมดจะถูกลบเพื่อให้สามารถตั้งค่ารหัสผ่านใหม่ได้": {
    "en": "Confirm password reset? All saved accounts will be deleted to set a new password.",
    "ja": "パスワードリセットを確認しますか？新しいパスワードを設定するため全アカウントが削除されます。",
    "zh": "确认重置密码？所有保存的账户将被删除以便重新设置密码。",
    "ko": "비밀번호를 재설정하시겠습니까? 새 비밀번호를 설정하기 위해 저장된 모든 계정이 삭제됩니다.",
    "es": "¿Confirmar restablecimiento? Todas las cuentas se eliminarán para configurar nueva clave."
  },
  "ยืนยันการลบ": {
    "en": "Confirm Delete",
    "ja": "削除の確認",
    "zh": "确认删除",
    "ko": "삭제 확인",
    "es": "Confirmar eliminación"
  },
  "ยืนยันตัวตนได้ - ป้องกันการแก้ไข": {
    "en": "Verified session - Tamper protected",
    "ja": "認証済みセッション - 改ざん防止",
    "zh": "已验证身份 - 防篡改保护",
    "ko": "인증된 세션 - 변조 방지",
    "es": "Sesión verificada - Protegida contra modificaciones"
  },
  "ยืนยันตัวตนไม่สำเร็จ (403) คุกกี้อาจหมดอายุแล้ว": {
    "en": "Authentication failed (403). Cookie may be expired.",
    "ja": "認証に失敗しました (403)。クッキーが期限切れの可能性があります。",
    "zh": "身份验证失败 (403)。Cookie 可能已过期。",
    "ko": "인증 실패 (403). 쿠키가 만료되었을 수 있습니다.",
    "es": "Error de autenticación (403). La cookie puede haber caducado."
  },
  "รหัส": {
    "en": "ID",
    "ja": "ID",
    "zh": "ID",
    "ko": "ID",
    "es": "ID"
  },
  "รหัส ": {
    "en": "ID ",
    "ja": "ID ",
    "zh": "ID ",
    "ko": "ID ",
    "es": "ID "
  },
  "รหัสเกม:": {
    "en": "Game ID:",
    "ja": "ゲーム ID:",
    "zh": "游戏 ID:",
    "ko": "게임 ID:",
    "es": "ID del juego:"
  },
  "รหัสเกม": {
    "en": "Game ID",
    "ja": "ゲーム ID",
    "zh": "游戏 ID",
    "ko": "게임 ID",
    "es": "ID del juego"
  },
  "รหัสเกมหรือ ลิงก์เซิร์ฟเวอร์ส่วนตัว": {
    "en": "Game ID or Private Server link",
    "ja": "ゲーム ID またはプライベートサーバーリンク",
    "zh": "游戏 ID 或私人服务器链接",
    "ko": "게임 ID 또는 비공개 서버 링크",
    "es": "ID del juego o enlace de servidor privado"
  },
  "รหัสผู้ใช้ (User ID)": {
    "en": "User ID (User ID)",
    "ja": "ユーザー ID (User ID)",
    "zh": "用户 ID (User ID)",
    "ko": "사용자 ID (User ID)",
    "es": "ID de usuario (User ID)"
  },
  "รหัส Place": {
    "en": "Place ID",
    "ja": "Place ID",
    "zh": "Place ID",
    "ko": "Place ID",
    "es": "Place ID"
  },
  "รหัส Raw JSON": {
    "en": "Raw JSON Code",
    "ja": "Raw JSON コード",
    "zh": "原始 JSON 代码",
    "ko": "원시 JSON 코드",
    "es": "Código Raw JSON"
  },
  "รองรับเฉพาะ Windows": {
    "en": "Windows Only",
    "ja": "Windows 専用",
    "zh": "仅支持 Windows",
    "ko": "Windows 전용",
    "es": "Solo para Windows"
  },
  "ระดับคุณภาพการเรนเดอร์": {
    "en": "Rendering Quality Level",
    "ja": "レンダリング品質",
    "zh": "渲染质量级别",
    "ko": "렌더링 품질 수준",
    "es": "Nivel de calidad"
  },
  "ระดับเสียง": {
    "en": "Volume Level",
    "ja": "音量",
    "zh": "音量",
    "ko": "볼륨",
    "es": "Volumen"
  },
  "ระดับเสียงคลิก": {
    "en": "Click Sound Volume",
    "ja": "クリック音量",
    "zh": "点击音效音量",
    "ko": "클릭 효과음 볼륨",
    "es": "Volumen de sonido de clic"
  },
  "ระดับเสียงหลัก": {
    "en": "Master Volume",
    "ja": "マスター音量",
    "zh": "主音量",
    "ko": "마스터 볼륨",
    "es": "Volumen maestro"
  },
  "ระดับเสียง Roblox": {
    "en": "Roblox Volume",
    "ja": "Roblox 音量",
    "zh": "Roblox 音量",
    "ko": "Roblox 볼륨",
    "es": "Volumen de Roblox"
  },
  "ระบบค้นหาของ ScriptBlox กำลังปรับปรุง ได้แสดงผลลัพธ์ที่ตรงกันจากสคริปต์ยอดนิยม": {
    "en": "ScriptBlox search is under maintenance; showing matching popular scripts",
    "ja": "ScriptBloxの検索機能がメンテナンス中のため、人気スクリプトから一致する結果を表示しています",
    "zh": "ScriptBlox 搜索系统维护中，已显示热门脚本中的匹配结果",
    "ko": "ScriptBlox 검색 시스템 점검 중입니다. 인기 스크립트에서 일치하는 결과를 표시했습니다",
    "es": "La búsqueda de ScriptBlox está en mantenimiento; mostrando scripts populares"
  },
  "ระบบแจ้งเตือน MultiRoblox AntiAFK ทำงานเรียบร้อยแล้ว": {
    "en": "MultiRoblox Anti-AFK notification system is operational",
    "ja": "MultiRoblox Anti-AFK 通知システムが正常に動作しています",
    "zh": "MultiRoblox Anti-AFK 通知系统运行正常",
    "ko": "MultiRoblox Anti-AFK 알림 시스템이 정상 작동 중입니다",
    "es": "El sistema de notificaciones MultiRoblox Anti-AFK está operativo"
  },
  "ระบบต่อเชื่อมต่ออัตโนมัติ (Auto Reconnect & Reset)": {
    "en": "Auto Reconnect & Reset System",
    "ja": "自動再接続 & リセット (Auto Reconnect & Reset)",
    "zh": "自动重连与重置系统 (Auto Reconnect & Reset)",
    "ko": "자동 재연결 및 리셋 시스템 (Auto Reconnect & Reset)",
    "es": "Sistema de reconexión y reinicio automático"
  },
  "ระบบป้องกัน AFK และ FPS (Anti-AFK & FPS Capper)": {
    "en": "Anti-AFK & FPS Capper",
    "ja": "放置防止 & FPS 制限 (Anti-AFK & FPS Capper)",
    "zh": "防挂机与帧率限制器 (Anti-AFK & FPS Capper)",
    "ko": "자리비움 방지 및 FPS 제한기 (Anti-AFK & FPS Capper)",
    "es": "Anti-AFK y Limitador de FPS (Anti-AFK & FPS Capper)"
  },
  "ระบบป้องกัน AFK (Anti-AFK Control)": {
    "en": "Anti-AFK Control System",
    "ja": "Anti-AFK 制御システム (Anti-AFK Control)",
    "zh": "防挂机控制系统 (Anti-AFK Control)",
    "ko": "Anti-AFK 제어 시스템 (Anti-AFK Control)",
    "es": "Sistema de control Anti-AFK"
  },
  "ระบบรักษาความปลอดภัยรหัสผ่านโปรแกรม (App Security Lock)": {
    "en": "App Security Lock",
    "ja": "アプリセキュリティロック (App Security Lock)",
    "zh": "程序安全密码锁 (App Security Lock)",
    "ko": "앱 보안 잠금 시스템 (App Security Lock)",
    "es": "Bloqueo de seguridad de la app"
  },
  "ระบบแสงสมจริง Future Phase 3": {
    "en": "Future Phase 3 Lighting System",
    "ja": "Future Phase 3 リアルライティング",
    "zh": "Future Phase 3 真实光影系统",
    "ko": "Future Phase 3 사실적 조명 시스템",
    "es": "Sistema de iluminación Future Phase 3"
  },
  "ระบบ Discord Rich Presence (RPC)": {
    "en": "Discord Rich Presence (RPC) System",
    "ja": "Discord Rich Presence (RPC) システム",
    "zh": "Discord Rich Presence (RPC) 系统",
    "ko": "Discord Rich Presence (RPC) 시스템",
    "es": "Sistema Discord Rich Presence (RPC)"
  },
  "ระบุค่าสำหรับ": {
    "en": "Specify value for",
    "ja": "次の値を入力:",
    "zh": "指定以下数值:",
    "ko": "다음 값 지정:",
    "es": "Especificar valor para"
  },
  "ระบุค่าสำหรับ {0}:": {
    "en": "Specify value for {0}:",
    "ja": "{0} の値を入力:",
    "zh": "指定 {0} 的值:",
    "ko": "{0}의 값 지정:",
    "es": "Especificar valor para {0}:"
  },
  "ระบุชื่อ FastFlag ที่ต้องการเพิ่มลงในโปรไฟล์": {
    "en": "Enter FastFlag name to add to profile",
    "ja": "プロファイルに追加する FastFlag 名を入力",
    "zh": "输入要添加到配置文件的 FastFlag 名称",
    "ko": "프로필에 추가할 FastFlag 이름 입력",
    "es": "Introduce el nombre del FastFlag para añadir al perfil"
  },
  "ระบุชื่อ FastFlag ที่ต้องการเพิ่มลงในโปรไฟล์:": {
    "en": "Enter FastFlag name to add to profile:",
    "ja": "プロファイルに追加するFastFlag名を入力:",
    "zh": "输入要添加到配置文件的 FastFlag 名称:",
    "ko": "프로필에 추가할 FastFlag 이름을 입력하세요:",
    "es": "Introduce el nombre del FastFlag para añadir al perfil:"
  },
  "ระยะเวลาที่จะกดปุ่มกระตุ้นหน้าต่าง Roblox เพื่อป้องกันระบบตัดการเชื่อมต่อ": {
    "en": "Interval between actions sent to Roblox to prevent idle disconnect",
    "ja": "接続切断を防ぐため Roblox にキーを送信する間隔",
    "zh": "触发 Roblox 窗口防掉线动作的时间间隔",
    "ko": "접속 끊김을 방지하기 위해 Roblox 창에 동작을 전송하는 주기",
    "es": "Intervalo de tiempo para enviar acciones y evitar desconexión"
  },
  "รายการ": {
    "en": "Items",
    "ja": "件",
    "zh": "项",
    "ko": "개",
    "es": "elementos"
  },
  "รายการ)": {
    "en": "items)",
    "ja": "件)",
    "zh": "项)",
    "ko": "개)",
    "es": "elementos)"
  },
  "รายการโปรไฟล์ที่บันทึกไว้:": {
    "en": "Saved profiles list:",
    "ja": "保存済みプロファイル一覧:",
    "zh": "已保存配置文件列表:",
    "ko": "저장된 프로필 목록:",
    "es": "Lista de perfiles guardados:"
  },
  "รายการโปรไฟล์ที่บันทึกไว้": {
    "en": "Saved Profiles List",
    "ja": "保存済みプロファイル一覧",
    "zh": "已保存配置文件列表",
    "ko": "저장된 프로필 목록",
    "es": "Lista de perfiles guardados"
  },
  "รายการหรือไม่": {
    "en": "items?",
    "ja": "件？",
    "zh": "项吗？",
    "ko": "개 항목입니까?",
    "es": "elementos?"
  },
  "รายการ Roblox เวอร์ชันย้อนหลังที่แนะนำ (Curated Versions)": {
    "en": "Curated Roblox Versions",
    "ja": "おすすめ過去バージョン一覧 (Curated Versions)",
    "zh": "精选历史版本列表 (Curated Versions)",
    "ko": "추천 이전 버전 목록 (Curated Versions)",
    "es": "Versiones recomendadas de Roblox"
  },
  "รายละเอียดบัญชี": {
    "en": "Account Status",
    "ja": "アカウント詳細",
    "zh": "账户详情",
    "ko": "계정 상세",
    "es": "Detalles de cuenta"
  },
  "รีเซ็ต": {
    "en": "Reset",
    "ja": "リセット",
    "zh": "重置",
    "ko": "초기화",
    "es": "Restablecer"
  },
  "รีเซ็ตการตั้งค่า Voidstrap เรียบร้อยแล้ว": {
    "en": "Voidstrap settings reset successfully",
    "ja": "Voidstrap 設定をリセットしました",
    "zh": "Voidstrap 设置已成功重置",
    "ko": "Voidstrap 설정이 성공적으로 초기화되었습니다",
    "es": "Ajustes de Voidstrap restablecidos con éxito"
  },
  "รีเซ็ตตัวละครทุกจอทันที": {
    "en": "Reset Character on all windows immediately",
    "ja": "全画面でキャラクターを即座にリセット",
    "zh": "立即在所有窗口中重置角色",
    "ko": "모든 화면에서 즉시 캐릭터 리셋",
    "es": "Reiniciar personaje en todas las pantallas de inmediato"
  },
  "รีเซ็ตตัวละครไม่สำเร็จ": {
    "en": "Failed to reset character",
    "ja": "キャラクターのリセットに失敗しました",
    "zh": "重置角色失败",
    "ko": "캐릭터 리셋 실패",
    "es": "Error al reiniciar personaje"
  },
  "รีเซ็ตตัวละครไม่สำเร็จ:": {
    "en": "Failed to reset character:",
    "ja": "キャラクターのリセットに失敗:",
    "zh": "重置角色失败:",
    "ko": "캐릭터 리셋 실패:",
    "es": "Error al reiniciar personaje:"
  },
  "รีเซ็ตตัวละครสำเร็จ": {
    "en": "Character reset successfully",
    "ja": "キャラクターをリセットしました",
    "zh": "角色重置成功",
    "ko": "캐릭터 리셋 완료",
    "es": "Personaje reiniciado con éxito"
  },
  "รีเซ็ตตัวละครสำเร็จ ({0} จอ)": {
    "en": "Character reset successfully ({0} windows)",
    "ja": "キャラクターのリセットに成功 ({0} 画面)",
    "zh": "角色重置成功 ({0} 个窗口)",
    "ko": "캐릭터 리셋 성공 ({0}개 창)",
    "es": "Personaje reiniciado con éxito ({0} ventanas)"
  },
  "รีเซ็ตตัวละครอัตโนมัติ (Auto Reset)": {
    "en": "Auto Reset Character",
    "ja": "自動キャラクターリセット (Auto Reset)",
    "zh": "自动重置角色 (Auto Reset)",
    "ko": "캐릭터 자동 리셋 (Auto Reset)",
    "es": "Reinicio automático de personaje"
  },
  "รีเซ็ตรหัสผ่าน (Reset Password)": {
    "en": "Reset Password",
    "ja": "パスワードリセット (Reset Password)",
    "zh": "重置密码 (Reset Password)",
    "ko": "비밀번호 재설정 (Reset Password)",
    "es": "Restablecer contraseña"
  },
  "รีเซ็ต Flags": {
    "en": "Reset Flags",
    "ja": "Flags をリセット",
    "zh": "重置 Flags",
    "ko": "Flags 초기화",
    "es": "Restablecer Flags"
  },
  "รีเฟรช": {
    "en": "Refresh",
    "ja": "更新",
    "zh": "刷新",
    "ko": "새로고침",
    "es": "Actualizar"
  },
  "รีเฟรชคุกกี้อัตโนมัติ (Auto Refresh Cookies)": {
    "en": "Auto Refresh Cookies",
    "ja": "クッキー自動更新 (Auto Refresh Cookies)",
    "zh": "自动刷新 Cookie (Auto Refresh Cookies)",
    "ko": "쿠키 자동 갱신 (Auto Refresh Cookies)",
    "es": "Actualización automática de cookies"
  },
  "รีโหลด (Reload)": {
    "en": "Reload",
    "ja": "再読み込み (Reload)",
    "zh": "重新加载 (Reload)",
    "ko": "새로고침 (Reload)",
    "es": "Recargar"
  },
  "รูปแบบปุ่มส่งข้อมูลเข้าสู่เกม": {
    "en": "Game Join Button Style",
    "ja": "ゲーム参加ボタンスタイル",
    "zh": "加入游戏按钮样式",
    "ko": "게임 참가 버튼 스타일",
    "es": "Estilo del botón para entrar al juego"
  },
  "รูปแบบเมนู Escape (In-Game Menu Version)": {
    "en": "Escape Menu Version",
    "ja": "Esc メニュースタイル (In-Game Menu Version)",
    "zh": "Esc 菜单版本 (In-Game Menu Version)",
    "ko": "Esc 메뉴 버전 (In-Game Menu Version)",
    "es": "Versión del menú Escape"
  },
  "รูปแบบหัวลูกศรเมาส์": {
    "en": "Mouse Cursor Style",
    "ja": "マウスポインタースタイル",
    "zh": "鼠标指针样式",
    "ko": "마우스 커서 스타일",
    "es": "Estilo del cursor del ratón"
  },
  "รูปแบบ JSON ไม่ถูกต้อง": {
    "en": "Invalid JSON format",
    "ja": "JSON 形式が無効です",
    "zh": "JSON 格式错误",
    "ko": "잘못된 JSON 형식",
    "es": "Formato JSON no válido"
  },
  "รูปแบบ JSON ไม่ถูกต้อง กรุณาแก้ไขก่อนบันทึก": {
    "en": "Invalid JSON format. Please correct it before saving.",
    "ja": "JSON 形式が無効です。保存前に修正してください。",
    "zh": "JSON 格式错误，请在保存前修复。",
    "ko": "잘못된 JSON 형식입니다. 저장하기 전에 수정하세요.",
    "es": "Formato JSON no válido. Corrígelo antes de guardar."
  },
  "เร่งการพรีโหลดโมเดล 3D (Mesh Preloading)": {
    "en": "Mesh Preloading Optimization",
    "ja": "メッシュ事前読み込み高速化 (Mesh Preloading)",
    "zh": "加速 3D 模型预载 (Mesh Preloading)",
    "ko": "3D 메시 사전 로드 가속 (Mesh Preloading)",
    "es": "Precarga de mallas 3D"
  },
  "เร่งการพรีโหลด Mesh และ Assets เข้าสู่ RAM ล่วงหน้า ลดอาการกระตุก": {
    "en": "Preloads meshes and assets into RAM to reduce stutters and hitching",
    "ja": "メッシュやアセットを RAM に事前ロードし、カクつきを低減",
    "zh": "提前将网格与模型资源预载至内存，大幅降低卡顿感",
    "ko": "메시 및 에셋을 RAM에 미리 로드하여 게임 중 버벅거림을 완화합니다",
    "es": "Precarga mallas y recursos en RAM para reducir tirones"
  },
  "เรนเดอร์แบบ Multi-threaded (Multi-threading CPU)": {
    "en": "Multi-threaded Rendering (CPU Multi-threading)",
    "ja": "マルチスレッドレンダリング (CPU Multi-threading)",
    "zh": "多线程渲染 (CPU Multi-threading)",
    "ko": "멀티스레드 렌더링 (CPU 멀티스레딩)",
    "es": "Renderizado multihilo (CPU Multi-threading)"
  },
  "เริ่ม": {
    "en": "Launch",
    "ja": "Launch",
    "zh": "启动",
    "ko": "시작",
    "es": "Iniciar"
  },
  "เริ่มทั้งหมด": {
    "en": "Launch All",
    "ja": "すべて起動",
    "zh": "全部启动",
    "ko": "모두 시작",
    "es": "Iniciar todo"
  },
  "เริ่มทำงานทันทีเมื่อเปิดแอปพลิเคชัน": {
    "en": "Starts immediately when application opens",
    "ja": "アプリ起動時に即時開始",
    "zh": "软件打开时立即自动启动",
    "ko": "애플리케이션 실행 시 즉시 시작",
    "es": "Se inicia inmediatamente al abrir la aplicación"
  },
  "เริ่มทำงานอัตโนมัติเมื่อเปิดเครื่องคอมพิวเตอร์ หรือรีสตาร์ทเครื่องใหม่": {
    "en": "Auto starts when PC boots or restarts",
    "ja": "PC の起動または再起動時に自動開始",
    "zh": "在电脑开机或重启时自动运行",
    "ko": "컴퓨터 부팅 또는 재시작 시 자동으로 시작됩니다",
    "es": "Se inicia automáticamente al encender o reiniciar el ordenador"
  },
  "เริ่มนับเวลาตั้งแต่เข้าสู่เกม": {
    "en": "Start timer upon entering game",
    "ja": "ゲーム参加時からタイマーを開始",
    "zh": "从进入游戏开始计时",
    "ko": "게임 접속 시점부터 시간 측정 시작",
    "es": "Iniciar contador al entrar al juego"
  },
  "เริ่มเล่น": {
    "en": "Play",
    "ja": "Play",
    "zh": "เริ่มเล่น",
    "ko": "게임 시작",
    "es": "Jugar"
  },
  "เริ่มเล่นทั้งหมด": {
    "en": "Play All",
    "ja": "すべてプレイ",
    "zh": "全部开始",
    "ko": "모두 플레이",
    "es": "Jugar todos"
  },
  "เริ่ม / หยุด Anti-AFK": {
    "en": "Start / Stop Anti-AFK",
    "ja": "Anti-AFK 開始 / 停止",
    "zh": "启动 / 停止防挂机",
    "ko": "Anti-AFK 시작 / 중지",
    "es": "Iniciar / Detener Anti-AFK"
  },
  "เริ่ม MultiRoblox แล้ว": {
    "en": "MultiRoblox started",
    "ja": "MultiRoblox を起動しました",
    "zh": "MultiRoblox 已启动",
    "ko": "MultiRoblox 시작됨",
    "es": "MultiRoblox iniciado"
  },
  "เรียกโปรเซสไม่สำเร็จ": {
    "en": "Failed to invoke process",
    "ja": "プロセスの起動に失敗しました",
    "zh": "启动进程失败",
    "ko": "프로세스 호출 실패",
    "es": "Error al invocar proceso"
  },
  "เรียงลำดับ": {
    "en": "Sorting",
    "ja": "並び替え",
    "zh": "排序方式",
    "ko": "정렬",
    "es": "Ordenar"
  },
  "เรียบร้อยแล้ว": {
    "en": "Completed",
    "ja": "完了しました",
    "zh": "已完成",
    "ko": "완료되었습니다",
    "es": "Completado"
  },
  "ลงในบัญชีแล้ว": {
    "en": "into account",
    "ja": "アカウントに反映済み",
    "zh": "已存入账户",
    "ko": "계정에 반영됨",
    "es": "en la cuenta"
  },
  "ลงในโปรไฟล์แล้ว": {
    "en": "into profile",
    "ja": "プロファイルに反映済み",
    "zh": "已存入配置文件",
    "ko": "프로필에 반영됨",
    "es": "en el perfil"
  },
  "ลงใน ClientAppSettings แล้ว": {
    "en": "into ClientAppSettings",
    "ja": "ClientAppSettings に反映済み",
    "zh": "已写入 ClientAppSettings",
    "ko": "ClientAppSettings에 반영됨",
    "es": "en ClientAppSettings"
  },
  "ลดกราฟิกลงต่ำสุดเพื่อรันหลายจอและประหยัดทรัพยากร": {
    "en": "Drop graphics to minimum for multi-instance farming & resource saving",
    "ja": "多重起動向けにグラフィックを最小化してリソースを節約",
    "zh": "将画质降至最低，以便多开并节省系统资源",
    "ko": "다중 실행 및 리소스 절약을 위해 그래픽을 최저로 설정",
    "es": "Bajar gráficos al mínimo para ejecutar varias ventanas y ahorrar recursos"
  },
  "ลดความสว่าง/โปร่งใสหน้าต่างเบื้องหลังเพื่อลดสายตา": {
    "en": "Dim/transparentize background windows to reduce eye fatigue",
    "ja": "目の疲れを軽減するためバックグラウンドウィンドウの明度/透明度を下げる",
    "zh": "降低后台窗口亮度与透明度以减缓视觉疲劳",
    "ko": "눈의 피로를 줄이기 위해 백그라운드 창의 밝기/투명도를 낮춥니다",
    "es": "Atenúa ventanas en segundo plano para reducir la fatiga visual"
  },
  "ลดทอน Texture พื้นดิน น้ำ และหญ้า 3D ให้อยู่ในโหมดเรียบง่าย": {
    "en": "Simplifies terrain, water, and grass textures to low detail",
    "ja": "地形、水、3D 草のテクスチャを簡略化",
    "zh": "将地形、水体与 3D 草皮纹理降至极简模式",
    "ko": "지형, 물 및 3D 잔디 텍스처를 단순화 모드로 축소",
    "es": "Simplifica las texturas de terreno, agua y césped"
  },
  "ลดระดับความละเอียดของ Mesh ในระยะไกลเพื่อลดภาระ GPU": {
    "en": "Reduces mesh detail at a distance (LOD) to decrease GPU workload",
    "ja": "遠景メッシュの解像度を下げて GPU 負荷を軽減 (LOD)",
    "zh": "降低远景网格细节度以减轻显卡负载 (LOD)",
    "ko": "원거리 메시 해상도를 낮춰 GPU 부하를 줄입니다 (LOD)",
    "es": "Reduce el detalle de mallas lejanas para aligerar la GPU"
  },
  "ล้มเหลว": {
    "en": "Failed",
    "ja": "失敗",
    "zh": "失败",
    "ko": "실패",
    "es": "Fallido"
  },
  "ลบ": {
    "en": "Delete",
    "ja": "削除",
    "zh": "删除",
    "ko": "삭제",
    "es": "Eliminar"
  },
  "ลบ \"": {
    "en": "Delete \"",
    "ja": "削除「",
    "zh": "删除 “",
    "ko": "삭제 \"",
    "es": "Eliminar \""
  },
  "ลบ {0} แล้ว": {
    "en": "Deleted {0}",
    "ja": "{0} を削除しました",
    "zh": "已删除 {0}",
    "ko": "{0} 삭제됨",
    "es": "{0} eliminado"
  },
  "ลบกลุ่ม": {
    "en": "Delete Package",
    "ja": "グループを削除",
    "zh": "删除群组",
    "ko": "그룹 삭제",
    "es": "Eliminar grupo"
  },
  "ลบกลุ่ม \"": {
    "en": "Delete package \"",
    "ja": "グループを削除 \"",
    "zh": "删除群组 \"",
    "ko": "그룹 삭제 \"",
    "es": "Eliminar grupo \""
  },
  "ลบกลุ่มแล้ว": {
    "en": "Package deleted",
    "ja": "グループを削除しました",
    "zh": "群组已删除",
    "ko": "그룹 삭제됨",
    "es": "Grupo eliminado"
  },
  "ลบที่เลือกไว้": {
    "en": "Delete Selected",
    "ja": "選択した項目を削除",
    "zh": "删除所选项",
    "ko": "선택 항목 삭제",
    "es": "Eliminar seleccionados"
  },
  "ลบบัญชีทั้งหมด": {
    "en": "Delete All Accounts",
    "ja": "すべてのアカウントを削除",
    "zh": "删除所有账户",
    "ko": "모든 계정 삭제",
    "es": "Eliminar todas las cuentas"
  },
  "ลบบัญชีทั้งหมดแล้ว": {
    "en": "All accounts deleted",
    "ja": "すべてのアカウントを削除しました",
    "zh": "已删除所有账户",
    "ko": "모든 계정이 삭제되었습니다",
    "es": "Todas las cuentas han sido eliminadas"
  },
  "ลบบัญชีที่บันทึกไว้และข้อมูลเข้าสู่ระบบทั้งหมด": {
    "en": "Removes all saved accounts and login data",
    "ja": "保存されたすべてのアカウントとログインデータを削除します",
    "zh": "删除所有保存的的账户和登录凭证",
    "ko": "저장된 모든 계정과 로그인 데이터를 영구 삭제합니다",
    "es": "Elimina todas las cuentas y datos de sesión"
  },
  "ลบโปรไฟล์": {
    "en": "Delete Profile",
    "ja": "プロファイルを削除",
    "zh": "删除配置文件",
    "ko": "프로필 삭제",
    "es": "Eliminar perfil"
  },
  "ลบโปรไฟล์ {0} เรียบร้อยแล้ว": {
    "en": "Deleted profile {0} successfully",
    "ja": "プロファイル {0} を削除しました",
    "zh": "已删除配置文件 {0}",
    "ko": "프로필 {0} 삭제 완료",
    "es": "Perfil {0} eliminado con éxito"
  },
  "ลบไม่สำเร็จ": {
    "en": "Delete failed",
    "ja": "削除に失敗しました",
    "zh": "删除失败",
    "ko": "삭제 실패",
    "es": "Error al eliminar"
  },
  "ลบไม่สำเร็จ:": {
    "en": "Failed to delete:",
    "ja": "削除に失敗:",
    "zh": "删除失败:",
    "ko": "삭제 실패:",
    "es": "Error al eliminar:"
  },
  "ลบรหัสผ่านหลักที่ใช้เข้ารหัสบัญชีทั้งหมด (ต้องล็อกอินใหม่ทั้งหมด)": {
    "en": "Reset master encryption password (requires re-login for all accounts)",
    "ja": "暗号化マスターパスワードを削除 (すべてのアカウントで再ログインが必要)",
    "zh": "清除用于加密的主密码 (需要重新登录所有账户)",
    "ko": "마스터 암호화 비밀번호 초기화 (모든 계정에 재로그인 필요)",
    "es": "Restablecer contraseña maestra (requiere volver a iniciar sesión en todas las cuentas)"
  },
  "ลบรอยหยักของขอบวัตถุ 3D ให้อยู่ในระดับเนียนตาและสมดุล": {
    "en": "Smooths 3D object edges with balanced visual quality and performance",
    "ja": "3D オブジェクトのギザギザを滑らかにし視覚品質と性能を両立",
    "zh": "平滑消除 3D 物体边缘锯齿，兼顾清晰度与性能平衡",
    "ko": "3D 오브젝트 외곽선 계단 현상을 부드럽게 완화하여 품질과 성능 균형 유지",
    "es": "Suaviza los bordes 3D con equilibrio entre calidad y rendimiento"
  },
  "ลบ FastFlags ทั้งหมดเรียบร้อยแล้ว": {
    "en": "All FastFlags deleted successfully",
    "ja": "すべての FastFlags を削除しました",
    "zh": "已成功删除所有 FastFlags",
    "ko": "모든 FastFlags가 성공적으로 삭제되었습니다",
    "es": "Todos los FastFlags eliminados con éxito"
  },
  "ลบ Flag นี้": {
    "en": "Delete this Flag",
    "ja": "この Flag を削除",
    "zh": "删除此 Flag",
    "ko": "이 Flag 삭제",
    "es": "Eliminar este Flag"
  },
  "ลบ Flag นี้ออกจากโปรไฟล์": {
    "en": "Delete this Flag from profile",
    "ja": "プロファイルからこの Flag を削除",
    "zh": "从配置文件中删除此 Flag",
    "ko": "프로필에서 이 Flag 삭제",
    "es": "Eliminar este Flag del perfil"
  },
  "ลบ Flag ไม่สำเร็จ": {
    "en": "Failed to delete Flag",
    "ja": "Flag の削除に失敗しました",
    "zh": "删除 Flag 失败",
    "ko": "Flag 삭제 실패",
    "es": "Error al eliminar Flag"
  },
  "ลบ Flag ไม่สำเร็จ:": {
    "en": "Failed to delete flag:",
    "ja": "Flagの削除に失敗:",
    "zh": "删除 Flag 失败:",
    "ko": "Flag 삭제 실패:",
    "es": "Error al eliminar flag:"
  },
  "ลบ Flags ที่เลือกเรียบร้อยแล้ว": {
    "en": "Selected Flags deleted successfully",
    "ja": "選択した Flags を削除しました",
    "zh": "已成功删除选中的 Flags",
    "ko": "선택한 Flags가 삭제되었습니다",
    "es": "Flags seleccionados eliminados con éxito"
  },
  "ลบ Flags ไม่สำเร็จ": {
    "en": "Failed to delete Flags",
    "ja": "Flags の削除に失敗しました",
    "zh": "删除 Flags 失败",
    "ko": "Flags 삭제 실패",
    "es": "Error al eliminar Flags"
  },
  "ลบ Flags ไม่สำเร็จ:": {
    "en": "Failed to delete flags:",
    "ja": "Flagsの削除に失敗:",
    "zh": "删除 Flags 失败:",
    "ko": "Flags 삭제 실패:",
    "es": "Error al eliminar flags:"
  },
  "ล็อกขอบเข้าหากันแบบแม่เหล็กเพื่อความเรียบร้อย": {
    "en": "Magnetic window edge snapping for clean layout",
    "ja": "端同士をマグネット吸着させて綺麗に整列",
    "zh": "窗口边缘磁性吸附以便整齐排列",
    "ko": "깔끔한 정렬을 위해 창 모서리를 자석처럼 스냅",
    "es": "Ajuste magnético entre bordes para un diseño limpio"
  },
  "ล็อกขอบ (Magnet)": {
    "en": "Magnetic Snapping",
    "ja": "マグネットスナップ (Magnet)",
    "zh": "磁性吸附 (Magnet)",
    "ko": "마그넷 스냅 (Magnet)",
    "es": "Ajuste magnético"
  },
  "ลองโหลดต่อ": {
    "en": "Retry Loading",
    "ja": "読み込みを再試行",
    "zh": "尝试继续加载",
    "ko": "계속 로드 시도",
    "es": "Reintentar carga"
  },
  "ลองใหม่อีกครั้ง": {
    "en": "Try Again",
    "ja": "もう一度やり直す",
    "zh": "重试",
    "ko": "다시 시도",
    "es": "Intentar de nuevo"
  },
  "ลากเพื่อปรับความดังของเสียงคลิก": {
    "en": "Drag to adjust click sound volume",
    "ja": "ドラッグしてクリック音量を調整",
    "zh": "拖动以调整点击音量",
    "ko": "드래그하여 클릭 볼륨 조절",
    "es": "Arrastra para ajustar el volumen de clic"
  },
  "ล้าง": {
    "en": "Clear",
    "ja": "消去",
    "zh": "清除",
    "ko": "지우기",
    "es": "Limpiar"
  },
  "ล้างตำแหน่งหน้าต่างทั้งหมดเรียบร้อยแล้ว": {
    "en": "All window positions cleared successfully",
    "ja": "すべてのウィンドウ位置をクリアしました",
    "zh": "已成功清除所有窗口位置",
    "ko": "모든 창 위치가 초기화되었습니다",
    "es": "Posiciones de todas las ventanas borradas con éxito"
  },
  "ล้างทั้งหมด": {
    "en": "Clear All",
    "ja": "すべて消去",
    "zh": "清除全部",
    "ko": "전체 삭제",
    "es": "Limpiar todo"
  },
  "ล้างประวัติ": {
    "en": "Clear History",
    "ja": "履歴をクリア",
    "zh": "清除历史记录",
    "ko": "기록 삭제",
    "es": "Limpiar historial"
  },
  "ล้างประวัติแล้ว": {
    "en": "History cleared",
    "ja": "履歴を消去しました",
    "zh": "已清除历史记录",
    "ko": "기록이 삭제되었습니다",
    "es": "Historial borrado"
  },
  "ล้างพิกัดทั้งหมด": {
    "en": "Clear All Coordinates",
    "ja": "すべての座標をクリア",
    "zh": "清除所有坐标",
    "ko": "모든 좌표 지우기",
    "es": "Limpiar todas las coordenadas"
  },
  "ล้างพิกัดที่ตั้งไว้ทั้งหมด": {
    "en": "Clear all set coordinates",
    "ja": "設定済みのすべての座標をクリア",
    "zh": "清除所有已设置的坐标",
    "ko": "설정된 모든 좌표 지우기",
    "es": "Limpiar todas las coordenadas configuradas"
  },
  "ลิงก์แชร์ไม่ถูกต้อง - ไม่พบโค้ด": {
    "en": "Invalid share link - No code found",
    "ja": "無効な共有リンクです - コードが見つかりません",
    "zh": "无效分享链接 - 未找到代码",
    "ko": "잘못된 공유 링크입니다 - 코드를 찾을 수 없습니다",
    "es": "Enlace no válido - no se encontró el código"
  },
  "ลิงก์ URL ปุ่มที่ 1": {
    "en": "Button 1 URL",
    "ja": "ボタン1のURL",
    "zh": "按钮 1 链接",
    "ko": "버튼 1 URL",
    "es": "URL del botón 1"
  },
  "ลิงก์ URL ปุ่มที่ 2 (เว้นว่างไว้เพื่อชวนเข้าแมพ Roblox อัตโนมัติ)": {
    "en": "Button 2 URL (Leave empty to invite to Roblox map automatically)",
    "ja": "ボタン2のURL (空欄の場合、Robloxマップへの招待が自動設定されます)",
    "zh": "按钮 2 链接 (留空则自动邀请加入 Roblox 地图)",
    "ko": "버튼 2 링크 (비워두면 자동으로 Roblox 맵 초대 링크 설정)",
    "es": "URL del botón 2 (deja en blanco para invitar al mapa automáticamente)"
  },
  "เล่นเมื่อคลิกปุ่มและองค์ประกอบที่โต้ตอบได้": {
    "en": "Plays sound on clicking buttons and interactive elements",
    "ja": "ボタンやインタラクティブ要素のクリック時にサウンドを再生",
    "zh": "点击按钮及可交互元素时播放音效",
    "ko": "버튼 및 상호작용 요소 클릭 시 효과음 재생",
    "es": "Reproduce sonido al hacer clic en botones y elementos interactivos"
  },
  "เลือกเซิร์ฟเวอร์เป้าหมายสำเร็จ: Job ID": {
    "en": "Target server selected: Job ID",
    "ja": "ターゲットサーバーを選択しました: Job ID",
    "zh": "已成功选择目标服务器: Job ID",
    "ko": "대상 서버 선택 완료: Job ID",
    "es": "Servidor seleccionado: Job ID"
  },
  "เลือกเซิร์ฟเวอร์เป้าหมายสำเร็จ: Job ID {0} (ผู้เล่น: {1}/{2}, ปิง: {3}ms)": {
    "en": "Target server selected: Job ID {0} (Players: {1}/{2}, Ping: {3}ms)",
    "ja": "ターゲットサーバーを選択しました: Job ID {0} (プレイヤー: {1}/{2}, Ping: {3}ms)",
    "zh": "已成功选择目标服务器: Job ID {0} (玩家数: {1}/{2}, 延迟: {3}ms)",
    "ko": "대상 서버 선택 완료: Job ID {0} (플레이어: {1}/{2}, 핑: {3}ms)",
    "es": "Servidor seleccionado: Job ID {0} (Jugadores: {1}/{2}, Ping: {3}ms)"
  },
  "เลือกดาวน์โหลดและติดตั้งตัวเกม Roblox เวอร์ชันเก่าย้อนหลัง หรือเวอร์ชันเฉพาะตามต้องการ": {
    "en": "Download and install previous or specific Roblox client versions as needed",
    "ja": "必要に応じて過去または特定の Roblox クライアントバージョンをダウンロード・インストール",
    "zh": "按需选择下载并安装历史版本或特定版本的 Roblox 客户端",
    "ko": "필요에 따라 이전 또는 특정 버전의 Roblox 클라이언트를 다운로드하여 설치하세요",
    "es": "Descarga e instala versiones anteriores o específicas de Roblox según necesites"
  },
  "เลือกเทคโนโลยีการคำนวณแสงและเงา": {
    "en": "Select lighting and shadow calculation technology",
    "ja": "光と影のレンダリング方式を選択",
    "zh": "选择光影计算渲染技术",
    "ko": "조명 및 그림자 연산 기술 선택",
    "es": "Selecciona la tecnología de iluminación y sombras"
  },
  "เลือกบัญชี": {
    "en": "Select Account",
    "ja": "アカウントを選択",
    "zh": "选择账户",
    "ko": "계정 선택",
    "es": "Seleccionar cuenta"
  },
  "เลือกบัญชีที่จะเข้าเล่น": {
    "en": "Select accounts to play",
    "ja": "プレイするアカウントを選択",
    "zh": "选择要入戏的账户",
    "ko": "플레이할 계정 선택",
    "es": "Seleccionar cuentas para jugar"
  },
  "เลือกโปรแกรมที่ MultiRoblox จะใช้เรียกเปิด Roblox เมื่อกด Launch บัญชี": {
    "en": "Select the bootstrapper program MultiRoblox uses to launch accounts",
    "ja": "MultiRoblox がアカウント起動時に使用するプログラムを選択",
    "zh": "选择 MultiRoblox 启动账户时所使用的引导客户端程序",
    "ko": "MultiRoblox가 계정 실행 시 사용할 부트스트래퍼 프로그램을 선택하세요",
    "es": "Selecciona el programa que MultiRoblox usará para abrir Roblox"
  },
  "เลือกโปรแกรมเปิดเกม (Bootstrapper)": {
    "en": "Select Bootstrapper",
    "ja": "ブートストラップを選択",
    "zh": "选择游戏引导程序 (Bootstrapper)",
    "ko": "부트스트래퍼 선택",
    "es": "Seleccionar Bootstrapper"
  },
  "เลือกโปรไฟล์ที่ปรับแต่งมาเพื่อการใช้งานเฉพาะด้าน สามารถกดปรับใช้ทันที หรือเปิดดูและแก้ไขชุด Flags ในแต่ละโปรไฟล์ได้": {
    "en": "Choose specialized profiles. Apply instantly or inspect and edit individual Flags.",
    "ja": "用途別に調整されたプロファイルを選択。ワンクリックで適用または中身を確認・編集できます。",
    "zh": "选择专门调校的配置文件。可立即应用，或查看和编辑每个配置中的 Flags。",
    "ko": "용도별 맞춤 프로필 선택. 즉시 적용하거나 각 프로필의 Flags를 확인 및 편집하세요.",
    "es": "Elige perfiles optimizados. Aplica al instante o revisa y edita los Flags."
  },
  "เลือกไฟล์...": {
    "en": "Select file...",
    "ja": "ファイルを選択...",
    "zh": "选择文件...",
    "ko": "파일 선택...",
    "es": "Seleccionar archivo..."
  },
  "เลือกไฟล์": {
    "en": "Select File",
    "ja": "ファイルを選択",
    "zh": "选择文件",
    "ko": "파일 선택",
    "es": "Seleccionar archivo"
  },
  "เลือกไฟล์เคอร์เซอร์": {
    "en": "Select Cursor File",
    "ja": "カーソルファイルを選択",
    "zh": "选择指针文件",
    "ko": "커서 파일 선택",
    "es": "Seleccionar archivo de cursor"
  },
  "เลือกไฟล์เคอร์เซอร์:": {
    "en": "Select cursor file:",
    "ja": "カーソルファイルを選択:",
    "zh": "选择光标文件:",
    "ko": "커서 파일 선택:",
    "es": "Seleccionar archivo de cursor:"
  },
  "เลือกไฟล์ไม่สำเร็จ": {
    "en": "Failed to select file",
    "ja": "ファイルの選択に失敗しました",
    "zh": "选择文件失败",
    "ko": "파일 선택 실패",
    "es": "Error al seleccionar archivo"
  },
  "เลือกไฟล์ไม่สำเร็จ:": {
    "en": "Failed to select file:",
    "ja": "ファイルの選択に失敗:",
    "zh": "选择文件失败:",
    "ko": "파일 선택 실패:",
    "es": "Error al seleccionar archivo:"
  },
  "เลือกไฟล์เสียง...": {
    "en": "Select audio file...",
    "ja": "音声ファイルを選択...",
    "zh": "选择音频文件...",
    "ko": "오디오 파일 선택...",
    "es": "Seleccionar archivo de audio..."
  },
  "เลือกไฟล์เสียง": {
    "en": "Select Audio File",
    "ja": "音声ファイルを選択",
    "zh": "选择音频文件",
    "ko": "오디오 파일 선택",
    "es": "Seleccionar archivo de audio"
  },
  "เลือกไฟล์เสียงตาย": {
    "en": "Select Death Sound File",
    "ja": "死亡音ファイルを選択",
    "zh": "选择死亡音效文件",
    "ko": "사망 오디오 파일 선택",
    "es": "Seleccionar sonido de muerte"
  },
  "เลือกไฟล์เสียงตาย:": {
    "en": "Select death sound file:",
    "ja": "死亡音ファイルを選択:",
    "zh": "选择死亡音效文件:",
    "ko": "사망 효과음 파일 선택:",
    "es": "Seleccionar archivo de sonido de muerte:"
  },
  "เลือกไฟล์เสียง .ogg, .mp3, .wav ของตัวเอง": {
    "en": "Select custom .ogg, .mp3, or .wav audio file",
    "ja": "カスタムの .ogg, .mp3, .wav ファイルを選択",
    "zh": "选择您自己的 .ogg, .mp3 或 .wav 音频文件",
    "ko": "자신의 .ogg, .mp3, .wav 오디오 파일 선택",
    "es": "Elige tu archivo .ogg, .mp3 o .wav personalizado"
  },
  "เลือกไฟล์ Bootstrapper สำเร็จแล้ว": {
    "en": "Bootstrapper file selected successfully",
    "ja": "ブートストラップファイルを選択しました",
    "zh": "已成功选择引导程序文件",
    "ko": "부트스트래퍼 파일 선택 완료",
    "es": "Archivo del bootstrapper seleccionado con éxito"
  },
  "เลือกไฟล์ .exe ที่ต้องการใช้เปิดเกมด้วยตัวเอง": {
    "en": "Select custom .exe file to launch game manually",
    "ja": "ゲーム起動に使用するカスタム .exe ファイルを選択",
    "zh": "选择用于启动游戏的自定义 .exe 文件",
    "ko": "게임을 실행할 커스텀 .exe 파일을 직접 선택하세요",
    "es": "Selecciona el archivo .exe que deseas usar para iniciar el juego"
  },
  "เลือกภาษา": {
    "en": "Select Language",
    "ja": "言語を選択",
    "zh": "选择语言",
    "ko": "언어 선택",
    "es": "Seleccionar idioma"
  },
  "เลือกภาษาหลักที่จะแสดงในโปรแกรม ภาษาเริ่มต้นคือภาษาไทย": {
    "en": "Select default app interface language. Default is Thai.",
    "ja": "アプリのデフォルト表示言語を選択。デフォルトはタイ語。",
    "zh": "选择软件默认界面语言，默认为泰语。",
    "ko": "앱의 기본 표시 언어를 선택합니다. 기본은 태국어입니다.",
    "es": "Selecciona el idioma predeterminado de la app. Por defecto es tailandés."
  },
  "เลือกรูปเคอร์เซอร์...": {
    "en": "Select cursor image...",
    "ja": "カーソル画像を選択...",
    "zh": "选择鼠标指针图片...",
    "ko": "커서 이미지 선택...",
    "es": "Seleccionar imagen de cursor..."
  },
  "เลือกรูปเคอร์เซอร์": {
    "en": "Select Cursor Image",
    "ja": "カーソル画像を選択",
    "zh": "选择鼠标指针图片",
    "ko": "커서 이미지 선택",
    "es": "Seleccionar imagen de cursor"
  },
  "เลือกรูปแบบการนับเวลาบน Discord": {
    "en": "Select timestamp display format on Discord",
    "ja": "Discord でのタイムスタンプ表示形式を選択",
    "zh": "选择在 Discord 上的计时显示格式",
    "ko": "Discord 표시 시간 형식 선택",
    "es": "Elige el formato de tiempo en Discord"
  },
  "เลือกรูปแบบการส่งคำสั่งป้อนข้อมูลเพื่อป้องกันระบบตัดการเชื่อมต่อ": {
    "en": "Select input method used to prevent idle timeout",
    "ja": "切断防止のために送信する入力方式を選択",
    "zh": "选择用于防止闲置超时的输入操作方式",
    "ko": "연결 끊김을 방지하기 위한 입력 시뮬레이션 방식 선택",
    "es": "Selecciona el método de entrada para evitar desconexión"
  },
  "เลือกแล้ว": {
    "en": "Selected",
    "ja": "選択済み",
    "zh": "已选择",
    "ko": "선택됨",
    "es": "Seleccionado"
  },
  "เลือกแล้ว 0 บัญชี": {
    "en": "0 accounts selected",
    "ja": "0 個のアカウントが選択されています",
    "zh": "已选择 0 个账户",
    "ko": "선택된 계정 0개",
    "es": "0 cuentas seleccionadas"
  },
  "เลือกวิธีดึงโฟกัสหน้าต่างกลับเมื่อกด Anti-AFK": {
    "en": "Select method to restore window focus during Anti-AFK",
    "ja": "Anti-AFK 実行時にウィンドウのフォーカスを復帰させる方法を選択",
    "zh": "选择在防挂机操作时恢复窗口焦点的方式",
    "ko": "Anti-AFK 실행 시 창 포커스를 복원하는 방법 선택",
    "es": "Elige cómo recuperar el foco de la ventana en Anti-AFK"
  },
  "เลือกเวอร์ชันของหน้าต่างเมนู Esc ภายในเกม": {
    "en": "Select in-game Escape menu style version",
    "ja": "ゲーム内の Esc メニュースタイルバージョンを選択",
    "zh": "选择游戏内 Esc 菜单的样式版本",
    "ko": "게임 내 Esc 메뉴 스타일 버전 선택",
    "es": "Selecciona la versión del menú Escape en el juego"
  },
  "เลือกเสียงตายเมื่อตัวละครตาย": {
    "en": "Select audio played when character dies",
    "ja": "キャラクター死亡時に再生するサウンドを選択",
    "zh": "选择角色死亡时播放的声音",
    "ko": "캐릭터 사망 시 재생할 소리를 선택하세요",
    "es": "Selecciona el sonido cuando el personaje muere"
  },
  "เลือกหลายบัญชี": {
    "en": "Multi-Account Selection",
    "ja": "複数アカウント選択",
    "zh": "多账户选择",
    "ko": "다중 계정 선택",
    "es": "Selección múltiple de cuentas"
  },
  "เลือกเหตุการณ์ที่จะแจ้งเตือน:": {
    "en": "Select events to notify:",
    "ja": "通知するイベントを選択:",
    "zh": "选择要接收通知的事件:",
    "ko": "알림을 받을 이벤트 선택:",
    "es": "Selecciona eventos para notificar:"
  },
  "เลือกเหตุการณ์ที่จะแจ้งเตือน": {
    "en": "Select events to notify",
    "ja": "通知するイベントを選択",
    "zh": "选择要接收通知的事件",
    "ko": "알림을 받을 이벤트 선택",
    "es": "Selecciona eventos para notificar"
  },
  "แล้ว": {
    "en": "completed",
    "ja": "完了",
    "zh": "已完成",
    "ko": "완료됨",
    "es": "completado"
  },
  "วันที่แล้ว": {
    "en": "days ago",
    "ja": "日前",
    "zh": "天前",
    "ko": "일 전",
    "es": "días atrás"
  },
  "วางคีย์ API ของ BloxGen จาก bloxgen.net แล้วกดสร้างเพื่อสร้างบัญชี alt": {
    "en": "Paste BloxGen API key from bloxgen.net and click Generate to create alt accounts",
    "ja": "bloxgen.net から BloxGen API キーを貼り付け、「生成」をクリックして alt アカウントを作成します",
    "zh": "粘贴来自 bloxgen.net 的 BloxGen API 密钥，然后点击生成以创建备用账户",
    "ko": "bloxgen.net의 BloxGen API 키를 붙여넣고 생성을 눌러 부계정을 생성하세요",
    "es": "Pega la clave API de bloxgen.net y haz clic en Generar para crear cuentas secundarias"
  },
  "วางคุกกี้": {
    "en": "Paste Cookie",
    "ja": "クッキーを貼り付け",
    "zh": "粘贴 Cookie",
    "ko": "쿠키 붙여넣기",
    "es": "Pegar cookie"
  },
  "วางคุกกี้ .ROBLOSECURITY": {
    "en": "Paste .ROBLOSECURITY Cookie",
    "ja": ".ROBLOSECURITY クッキーを貼り付け",
    "zh": "粘贴 .ROBLOSECURITY Cookie",
    "ko": ".ROBLOSECURITY 쿠키 붙여넣기",
    "es": "Pegar cookie .ROBLOSECURITY"
  },
  "วางเฉพาะตัวเลขจาก URL": {
    "en": "Paste only numbers from URL",
    "ja": "URL 内の数字のみを貼り付け",
    "zh": "仅粘贴 URL 中的纯数字",
    "ko": "URL의 숫자만 붙여넣기",
    "es": "Pega solo los números de la URL"
  },
  "วางรหัส Hash เช่น version-e32560e271704ed2...": {
    "en": "Paste Hash code, e.g. version-e32560e271704ed2...",
    "ja": "Hash コードを貼り付け (例: version-e32560e271704ed2...)",
    "zh": "粘贴 Hash 代码，例如 version-e32560e271704ed2...",
    "ko": "Hash 코드 붙여넣기 (예: version-e32560e271704ed2...)",
    "es": "Pega el código Hash, ej. version-e32560e271704ed2..."
  },
  "วางรหัส Hash เช่น version-e32560e271704ed2": {
    "en": "Paste Hash code, e.g. version-e32560e271704ed2",
    "ja": "Hash コードを貼り付け (例: version-e32560e271704ed2)",
    "zh": "粘贴 Hash 代码，例如 version-e32560e271704ed2",
    "ko": "Hash 코드 붙여넣기 (예: version-e32560e271704ed2)",
    "es": "Pega el código Hash, ej. version-e32560e271704ed2"
  },
  "วางลิงก์เซิร์ฟเวอร์เต็ม": {
    "en": "Paste full server link",
    "ja": "サーバーの完全なリンクを貼り付け",
    "zh": "粘贴完整服务器链接",
    "ko": "전체 서버 링크 붙여넣기",
    "es": "Pegar enlace completo del servidor"
  },
  "วางลิงก์ Webhook ที่ก๊อปปี้มาจากช่อง Discord": {
    "en": "Paste Webhook URL copied from Discord channel",
    "ja": "Discord チャンネルからコピーした Webhook URL を貼り付け",
    "zh": "粘贴从 Discord 频道复制的 Webhook 链接",
    "ko": "Discord 채널에서 복사한 Webhook 링크 붙여넣기",
    "es": "Pega la URL de Webhook copiada de Discord"
  },
  "วาง .ROBLOSECURITY คุกกี้ หรือข้อความดิบที่มีคุกกี้ Roblox...": {
    "en": "Paste .ROBLOSECURITY cookie or raw text containing Roblox cookie...",
    "ja": ".ROBLOSECURITY クッキーまたはそれを含むテキストを貼り付け...",
    "zh": "粘贴 .ROBLOSECURITY Cookie 或包含 Roblox Cookie 的文本...",
    "ko": ".ROBLOSECURITY 쿠키 또는 해당 쿠키가 포함된 원시 텍스트를 붙여넣으세요...",
    "es": "Pega la cookie .ROBLOSECURITY o texto que la contenga..."
  },
  "วาง .ROBLOSECURITY คุกกี้ หรือข้อความดิบที่มีคุกกี้ Roblox": {
    "en": "Paste .ROBLOSECURITY cookie or raw text containing Roblox cookie",
    "ja": ".ROBLOSECURITY クッキーまたはそれを含むテキストを貼り付け",
    "zh": "粘贴 .ROBLOSECURITY Cookie 或包含 Roblox Cookie 的文本",
    "ko": ".ROBLOSECURITY 쿠키 또는 해당 쿠키가 포함된 원시 텍스트를 붙여넣으세요",
    "es": "Pega la cookie .ROBLOSECURITY o texto que la contenga"
  },
  "วิธีการดึงหน้าต่าง (Restore Window Method)": {
    "en": "Restore Window Method",
    "ja": "ウィンドウ復元方式 (Restore Window Method)",
    "zh": "窗口恢复方式 (Restore Window Method)",
    "ko": "창 복원 방식 (Restore Window Method)",
    "es": "Método de restauración de ventana"
  },
  "วิธีใช้": {
    "en": "Help",
    "ja": "ヘルプ",
    "zh": "帮助",
    "ko": "도움말",
    "es": "Ayuda"
  },
  "วิธีใช้โปรแกรม": {
    "en": "How to Use",
    "ja": "使い方",
    "zh": "使用指南",
    "ko": "사용법",
    "es": "Cómo usar"
  },
  "- วิธีที่ยังใช้ได้หลัง Roblox จำกัด Fast Flag แล้ว มีผลเมื่อเปิดครั้งถัดไป": {
    "en": "Works even after Roblox FFlags block. Takes effect next launch.",
    "ja": "Roblox の FFlags 制限後も動作。次回起動時に反映。",
    "zh": "即使 Roblox 限制 FFlags 后也依然有效。下次启动时生效。",
    "ko": "Roblox FFlags 차단 후에도 작동합니다. 다음 실행 시 반영.",
    "es": "Funciona tras el bloqueo de FFlags. Se aplica al reiniciar."
  },
  "วิธีที่ยังใช้ได้หลัง Roblox จำกัด Fast Flag แล้ว มีผลเมื่อเปิดครั้งถัดไป": {
    "en": "Works even after Roblox FFlags block. Takes effect next launch.",
    "ja": "Roblox の FFlags 制限後も動作。次回起動時に反映。",
    "zh": "即使 Roblox 限制 FFlags 后也依然有效。下次启动时生效。",
    "ko": "Roblox FFlags 차단 후에도 작동합니다. 다음 실행 시 반영.",
    "es": "Funciona tras el bloqueo de FFlags. Se aplica al reiniciar."
  },
  "เว้นว่าง:": {
    "en": "Leave blank:",
    "ja": "空欄:",
    "zh": "留空:",
    "ko": "비워두기:",
    "es": "Dejar vacío:"
  },
  "เว้นว่าง": {
    "en": "Leave blank",
    "ja": "空欄",
    "zh": "留空",
    "ko": "비워두기",
    "es": "Dejar vacío"
  },
  "เวลาใช้งานล่าสุด": {
    "en": "Last Used",
    "ja": "最終使用日",
    "zh": "最近使用",
    "ko": "최근 사용",
    "es": "Último uso"
  },
  "เวลาและรูปภาพ (Timestamps & Assets)": {
    "en": "Timestamps & Assets",
    "ja": "タイムスタンプと画像 (Timestamps & Assets)",
    "zh": "时间与图片素材 (Timestamps & Assets)",
    "ko": "시간 및 이미지 에셋 (Timestamps & Assets)",
    "es": "Marcas de tiempo e imágenes"
  },
  "เวอร์ชัน 1.0.0": {
    "en": "Version 1.0.0",
    "ja": "バージョン 1.0.0",
    "zh": "版本 1.0.0",
    "ko": "버전 1.0.0",
    "es": "Versión 1.0.0"
  },
  "เวอร์ชันเก่าย้อนหลัง ใช้งานราบรื่นบนเครื่องสเปกต่ำหรือรุ่นเก่า": {
    "en": "Legacy versions, runs smoothly on low-spec or older PCs",
    "ja": "低スペックPCや旧環境でも安定して動作する過去バージョン",
    "zh": "老旧经典版本，在低配置或旧电脑上运行更加流畅",
    "ko": "저사양 또는 구형 PC에서도 원활하게 실행되는 이전 버전",
    "es": "Versiones antiguas, funcionamiento fluido en PCs de bajos recursos"
  },
  "เวอร์ชันที่ติดตั้งอยู่:": {
    "en": "Installed version:",
    "ja": "インストール済みバージョン:",
    "zh": "当前安装版本:",
    "ko": "현재 설치된 버전:",
    "es": "Versión instalada:"
  },
  "เวอร์ชันที่ติดตั้งอยู่": {
    "en": "Installed Version",
    "ja": "インストール済みバージョン",
    "zh": "当前安装版本",
    "ko": "현재 설치된 버전",
    "es": "Versión instalada"
  },
  "เวอร์ชันล่าสุดในปัจจุบัน รองรับเซิร์ฟเวอร์ Roblox ล่าสุดทั้งหมด": {
    "en": "Latest current version, supports all latest Roblox servers",
    "ja": "最新バージョン。最新のすべての Roblox サーバーに対応",
    "zh": "当前最新版本，全面支持所有最新 Roblox 服务器",
    "ko": "현재 최신 버전으로 모든 최신 Roblox 서버를 지원합니다",
    "es": "Última versión actual, compatible con todos los servidores recientes"
  },
  "เวอร์ชันเสถียรก่อนหน้า การทำงานนิ่ง ป้องกันการแครชขณะเปิดหลายจอ": {
    "en": "Previous stable build, rocks solid against crashes during multi-instance",
    "ja": "安定稼働実績のある過去ビルド。多重起動時のクラッシュを防止",
    "zh": "以往稳定版本，运行稳固，可有效防止多开时崩溃",
    "ko": "이전 안정 빌드, 다중 실행 시 크래시 방지 및 안정적인 구동",
    "es": "Versión estable anterior, previene cierres al abrir varias pantallas"
  },
  "เวอร์ชัน Roblox": {
    "en": "Roblox Version",
    "ja": "Roblox バージョン",
    "zh": "Roblox 版本",
    "ko": "Roblox 버전",
    "es": "Versión de Roblox"
  },
  "สคริป": {
    "en": "Scripts",
    "ja": "スクリプト",
    "zh": "脚本",
    "ko": "스크립트",
    "es": "Scripts"
  },
  "ส่งการแจ้งเตือนไปยังช่อง Discord ของคุณ": {
    "en": "Send notifications directly to your Discord channel",
    "ja": "Discord チャンネルに通知を直接送信",
    "zh": "直接向您的 Discord 频道发送通知",
    "ko": "Discord 채널로 알림 바로 전송",
    "es": "Envía notificaciones directamente a tu canal de Discord"
  },
  "ส่งข้อความทดสอบไปยัง Discord Webhook เรียบร้อยแล้ว": {
    "en": "Test message sent to Discord Webhook successfully",
    "ja": "Discord Webhook にテストメッセージを正常に送信しました",
    "zh": "已成功向 Discord Webhook 发送测试消息",
    "ko": "Discord Webhook으로 테스트 메시지를 성공적으로 보냈습니다",
    "es": "Mensaje de prueba enviado al Discord Webhook con éxito"
  },
  "ส่งข้อความทดสอบไปยัง Discord Webhook เรียบร้อยแล้ว!": {
    "en": "Test message sent to Discord Webhook successfully!",
    "ja": "Discord Webhookにテストメッセージを送信しました！",
    "zh": "已成功发送测试消息到 Discord Webhook！",
    "ko": "Discord Webhook으로 테스트 메시지를 보냈습니다!",
    "es": "¡Mensaje de prueba enviado al Discord Webhook!"
  },
  "ส่งคำขอแล้ว (หากยังไม่แสดงผล กรุณาเปิดแอป Discord Desktop)": {
    "en": "Request sent (If not updating, please launch Discord Desktop app)",
    "ja": "リクエストを送信しました (更新されない場合は Discord デスクトップアプリを起動してください)",
    "zh": "已发送请求 (如未显示，请打开 Discord 桌面客户端)",
    "ko": "요청을 보냈습니다 (표시되지 않는 경우 Discord 데스크톱 앱을 실행하세요)",
    "es": "Solicitud enviada (si no se actualiza, abre la app de Discord)"
  },
  "ส่งคำสั่งรีเซ็ตตัวละครตามรอบเวลาที่กำหนด": {
    "en": "Sends reset character command periodically based on configured interval",
    "ja": "設定された周期でキャラクターリセットコマンドを自動送信",
    "zh": "按照设定的时间周期自动发送重置角色指令",
    "ko": "지정된 주기마다 캐릭터 리셋 명령을 자동으로 전송",
    "es": "Envía comando de reinicio de personaje periódicamente"
  },
  "ส่งคำสั่งรีเซ็ตตัวละครแล้ว": {
    "en": "Character reset command sent",
    "ja": "キャラクターリセットコマンドを送信しました",
    "zh": "已发送角色重置命令",
    "ko": "캐릭터 리셋 명령이 전송되었습니다",
    "es": "Comando de reinicio de personaje enviado"
  },
  "ส่งผ่านพารามิเตอร์เพิ่มเติมไปยังไคลเอนต์ Roblox ในการเปิดแต่ละครั้ง เช่น --app": {
    "en": "Pass additional command line arguments to Roblox on launch, e.g. --app",
    "ja": "Roblox 起動時にカスタム引数を渡します (例: --app)",
    "zh": "启动 Roblox 时传递自定义附加参数，例如 --app",
    "ko": "Roblox 실행 시 추가 명령줄 인수 전달 (예: --app)",
    "es": "Pasa argumentos adicionales a Roblox al iniciar, ej. --app"
  },
  "ส่งออกชุดตั้งค่าเป็นไฟล์ .json หรือนำเข้าไฟล์ที่บันทึกไว้จากคอมพิวเตอร์": {
    "en": "Export configuration to .json or import saved file from computer",
    "ja": "設定を .json としてエクスポート、または保存済みファイルをインポート",
    "zh": "导出设置为 .json 文件或从电脑导入已保存的文件",
    "ko": "설정을 .json 파일로 내보내거나 컴퓨터에서 저장된 파일 가져오기",
    "es": "Exporta configuración a .json o importa archivo guardado"
  },
  "ส่งออกไฟล์ล้มเหลว": {
    "en": "File export failed",
    "ja": "ファイルのエクスポートに失敗しました",
    "zh": "文件导出失败",
    "ko": "파일 내보내기 실패",
    "es": "Error al exportar archivo"
  },
  "ส่งออกไฟล์ล้มเหลว:": {
    "en": "Failed to export file:",
    "ja": "ファイルのエクスポートに失敗:",
    "zh": "导出文件失败:",
    "ko": "파일 내보내기 실패:",
    "es": "Error al exportar archivo:"
  },
  "ส่งออกไฟล์ JSON สำเร็จแล้ว": {
    "en": "JSON file exported successfully",
    "ja": "JSON ファイルをエクスポートしました",
    "zh": "已成功导出 JSON 文件",
    "ko": "JSON 파일을 성공적으로 내보냈습니다",
    "es": "Archivo JSON exportado con éxito"
  },
  "ส่งออก JSON": {
    "en": "Export JSON",
    "ja": "JSON をエクスポート",
    "zh": "导出 JSON",
    "ko": "JSON 내보내기",
    "es": "Exportar JSON"
  },
  "ส่ง Webhook ไม่สำเร็จ กรุณาตรวจสอบ URL หรือการเชื่อมต่ออินเทอร์เน็ต": {
    "en": "Failed to send Webhook. Check URL or internet connection.",
    "ja": "Webhook の送信に失敗しました。URLまたはネット接続を確認してください。",
    "zh": "发送 Webhook 失败。请检查 URL 或网络连接。",
    "ko": "Webhook 전송 실패. URL 또는 인터넷 연결을 확인하세요.",
    "es": "Error al enviar Webhook. Revisa la URL o la conexión."
  },
  "สด": {
    "en": "Live",
    "ja": "ライブ",
    "zh": "实时",
    "ko": "라이브",
    "es": "En vivo"
  },
  "สถานะการรันเกม ปริมาณคนในเซิร์ฟเวอร์ และเวลาใช้งาน": {
    "en": "Game running status, server player count, and uptime",
    "ja": "ゲームの稼働状況、サーバー人数、稼働時間",
    "zh": "游戏运行状态、服务器玩家数量及在线时长",
    "ko": "게임 실행 상태, 서버 인원수 및 플레이 시간",
    "es": "Estado del juego, cantidad de jugadores y tiempo de uso"
  },
  "สถานะ Bootstrapper:": {
    "en": "Bootstrapper Status:",
    "ja": "ブートストラップ状態:",
    "zh": "引导程序状态:",
    "ko": "부트스트래퍼 상태:",
    "es": "Estado del Bootstrapper:"
  },
  "สถานะ Bootstrapper": {
    "en": "Bootstrapper Status",
    "ja": "ブートストラップ状態",
    "zh": "引导程序状态",
    "ko": "부트스트래퍼 상태",
    "es": "Estado del Bootstrapper"
  },
  "สร้าง": {
    "en": "Generate",
    "ja": "生成",
    "zh": "生成",
    "ko": "생성",
    "es": "Generar"
  },
  "สร้างกลุ่ม": {
    "en": "Create Group",
    "ja": "グループを作成",
    "zh": "创建群组",
    "ko": "그룹 생성",
    "es": "Crear grupo"
  },
  "สร้างกลุ่มเพื่อเปิดหลายบัญชีเข้าเกมเดียวกันได้ในคลิกเดียว": {
    "en": "Create a group to launch multiple accounts into the same game with one click",
    "ja": "グループを作成して、複数のアカウントをワンクリックで同じゲームに起動します",
    "zh": "创建群组以一键启动多个账户进入同一游戏",
    "ko": "그룹을 생성하여 클릭 한 번으로 여러 계정을 같은 게임에 접속시키세요",
    "es": "Crea un grupo para abrir varias cuentas en el mismo juego con un clic"
  },
  "สร้างคีย์เข้ารหัส": {
    "en": "Generate Encryption Key",
    "ja": "暗号化キーを生成",
    "zh": "生成加密密钥",
    "ko": "암호화 키 생성",
    "es": "Generar clave de cifrado"
  },
  "สร้างบัญชีใหม่": {
    "en": "Generate Account",
    "ja": "アカウントを生成",
    "zh": "生成 new 账户",
    "ko": "계정 생성",
    "es": "Generar Cuenta"
  },
  "สร้างบัญชี alt Roblox ผ่าน BloxGen API": {
    "en": "Create Roblox alt accounts via BloxGen API",
    "ja": "Roblox alt アカウントを BloxGen API で作成",
    "zh": "通过 BloxGen API 创建 Roblox 备用账户",
    "ko": "BloxGen API를 통해 Roblox 부계정을 생성합니다",
    "es": "Crear cuentas secundarias de Roblox con BloxGen API"
  },
  "สลับโหมดสว่าง/มืด": {
    "en": "Toggle Light/Dark Theme",
    "ja": "ライト/ダークテーマ切り替え",
    "zh": "切换亮/暗模式",
    "ko": "밝은/어두운 테마 전환",
    "es": "Alternar tema Claro/Oscuro"
  },
  "ส่วนติดต่อภาษาอังกฤษ": {
    "en": "English Interface",
    "ja": "英語インターフェース",
    "zh": "英文界面",
    "ko": "영어 인터페이스",
    "es": "Interfaz en inglés"
  },
  "สว่าง": {
    "en": "Light",
    "ja": "ライト",
    "zh": "浅色",
    "ko": "밝음",
    "es": "Claro"
  },
  "สามารถแก้ไขค่า ลบ หรือเพิ่ม Flags แล้วกดบันทึกเพื่ออัปเดตโปรไฟล์": {
    "en": "Edit values, delete or add Flags, then click Save to update profile",
    "ja": "値の編集、削除、Flag の追加を行い、「保存」を押してプロファイルを更新",
    "zh": "可以编辑数值、删除或添加 Flags，然后点击保存以更新配置文件",
    "ko": "값을 편집하거나 Flags를 추가/삭제한 후 저장을 눌러 프로필을 업데이트하세요",
    "es": "Edita valores, elimina o añade Flags y pulsa Guardar para actualizar el perfil"
  },
  "สามารถซูมกล้องถอยหลังออกไปได้ไกลสุดขอบฟ้าโดยไม่ติดเพดานระยะทาง": {
    "en": "Allows zooming out without ceiling or distance boundaries",
    "ja": "上限に引っかかることなく視点をどこまでもズームアウト可能",
    "zh": "视距无视上限与距离天花板，可无限拉远",
    "ko": "거리 제한 없이 카메라를 끝없이 줌아웃할 수 있습니다",
    "es": "Permite alejar la cámara sin límite de distancia"
  },
  "สามารถซูมกล้องออกได้ไกลสุดขอบฟ้ามากกว่าค่าเดิมของเกม": {
    "en": "Allows camera zoom out far beyond standard game limit",
    "ja": "通常のゲーム制限を超えてカメラを最大ズームアウト可能",
    "zh": "允许相机视距拉远超越游戏默认极限",
    "ko": "게임 기본 제한보다 훨씬 멀리 카메라 줌아웃을 가능하게 합니다",
    "es": "Permite alejar la cámara mucho más allá del límite estándar"
  },
  "สายเกมเมอร์ (Gaming)": {
    "en": "Gaming Preset",
    "ja": "ゲーマー向け (Gaming)",
    "zh": "游戏玩家 (Gaming)",
    "ko": "게이밍 (Gaming)",
    "es": "Gamer (Gaming)"
  },
  "สายฟาร์ม (Farming)": {
    "en": "Farming Preset",
    "ja": "周回・放置向け (Farming)",
    "zh": "挂机农场 (Farming)",
    "ko": "파밍 (Farming)",
    "es": "Farming"
  },
  "สายมินิมอล (Minimal)": {
    "en": "Minimal Preset",
    "ja": "ミニマル (Minimal)",
    "zh": "极简流畅 (Minimal)",
    "ko": "미니멀 (Minimal)",
    "es": "Minimal"
  },
  "สำรองข้อมูล FastFlags Configuration": {
    "en": "Backup FastFlags Configuration",
    "ja": "FastFlags 設定をバックアップ",
    "zh": "备份 FastFlags 配置",
    "ko": "FastFlags 구성 백업",
    "es": "Copia de seguridad de configuración FastFlags"
  },
  "สำเร็จ": {
    "en": "Success",
    "ja": "成功",
    "zh": "成功",
    "ko": "성공",
    "es": "Éxito"
  },
  "สำเร็จรูป (Built-in)": {
    "en": "Built-in",
    "ja": "ビルトイン (Built-in)",
    "zh": "内置 (Built-in)",
    "ko": "내장 (Built-in)",
    "es": "Integrado (Built-in)"
  },
  "สำเร็จแล้ว": {
    "en": "Successful",
    "ja": "完了しました",
    "zh": "已完成",
    "ko": "완료됨",
    "es": "Completado"
  },
  "สำหรับ": {
    "en": "for",
    "ja": "対象:",
    "zh": "适用于",
    "ko": "대상:",
    "es": "para"
  },
  "สีตัวหนังสือ (Text)": {
    "en": "Text Color",
    "ja": "テキスト色 (Text)",
    "zh": "文字颜色 (Text)",
    "ko": "텍스트 색상 (Text)",
    "es": "Color de texto"
  },
  "สีแผงเมนู (Panel)": {
    "en": "Panel Color",
    "ja": "パネル色 (Panel)",
    "zh": "面板颜色 (Panel)",
    "ko": "패널 색상 (Panel)",
    "es": "Color del panel"
  },
  "สีพื้นหลัง (Background)": {
    "en": "Background Color",
    "ja": "背景色 (Background)",
    "zh": "背景颜色 (Background)",
    "ko": "배경 색상 (Background)",
    "es": "Color de fondo"
  },
  "สีอื่นๆ": {
    "en": "Other Colors",
    "ja": "その他の色",
    "zh": "其他颜色",
    "ko": "기타 색상",
    "es": "Otros colores"
  },
  "สีไฮไลท์กำหนดเอง (Custom Accent Color)": {
    "en": "Custom Accent Color",
    "ja": "カスタムアクセントカラー (Custom Accent)",
    "zh": "自定义强调色 (Custom Accent)",
    "ko": "사용자 지정 강조 색상 (Custom Accent)",
    "es": "Color de realce personalizado"
  },
  "สีไฮไลท์หลัก (Accent)": {
    "en": "Accent Color",
    "ja": "アクセントカラー (Accent)",
    "zh": "主要强调色 (Accent)",
    "ko": "주요 강조 색상 (Accent)",
    "es": "Color de realce"
  },
  "สุ่มเวลาการกดเพื่อจำลองพฤติกรรมมนุษย์และป้องกันการตรวจจับ": {
    "en": "Randomizes action timing to simulate human behavior and evade detection",
    "ja": "入力をランダム化し、人間の操作を模倣して検知を回避",
    "zh": "随机化按键时间以模拟人类行为，有效防止系统检测",
    "ko": "입력 타이밍을 무작위화하여 사람의 조작처럼 시뮬레이션하고 감지를 방지",
    "es": "Aleatoriza los tiempos para simular comportamiento humano y evitar detección"
  },
  "สุ่มเวลาและความหน่วงการกดจำลองมนุษย์": {
    "en": "Human-like random jitter and delay",
    "ja": "人間らしいランダムな微動と待機時間",
    "zh": "模拟真人的随机微动与按键延迟",
    "ko": "사람과 유사한 무작위 지터 및 키 지연",
    "es": "Tiempos aleatorios y retraso que simulan una persona"
  },
  "สูง": {
    "en": "Height",
    "ja": "高さ",
    "zh": "高度",
    "ko": "높이",
    "es": "Alto"
  },
  "สูง (H)": {
    "en": "Height (H)",
    "ja": "高さ (H)",
    "zh": "高度 (H)",
    "ko": "높이 (H)",
    "es": "Alto (H)"
  },
  "เสียง": {
    "en": "Sounds",
    "ja": "Sounds",
    "zh": "声音",
    "ko": "소리",
    "es": "Sonidos"
  },
  "เสียงกำหนดเอง": {
    "en": "Custom Audio",
    "ja": "カスタム音声",
    "zh": "自定义声音",
    "ko": "사용자 지정 오디오",
    "es": "Audio personalizado"
  },
  "เสียงกำหนดเอง (Custom Audio File)": {
    "en": "Custom Audio File",
    "ja": "カスタム音声ファイル (Custom Audio File)",
    "zh": "自定义音频文件 (Custom Audio File)",
    "ko": "사용자 지정 오디오 파일 (Custom Audio File)",
    "es": "Archivo de audio personalizado (Custom Audio File)"
  },
  "เสียงคลิก": {
    "en": "Click Sound",
    "ja": "クリック音",
    "zh": "点击声音",
    "ko": "클릭 소리",
    "es": "Sonido de clic"
  },
  "เสียงตาย (Death Sound Mod - ouch.ogg)": {
    "en": "Death Sound Mod (ouch.ogg)",
    "ja": "死亡音 Mod (ouch.ogg)",
    "zh": "死亡音效 Mod (ouch.ogg)",
    "ko": "사망 효과음 모드 (ouch.ogg)",
    "es": "Mod de sonido de muerte (ouch.ogg)"
  },
  "เสียงมาตรฐานของ Roblox ปัจจุบัน": {
    "en": "Default current Roblox sound",
    "ja": "現在の Roblox 標準サウンド",
    "zh": "当前 Roblox 默认标准音效",
    "ko": "현재 Roblox 기본 표준 사운드",
    "es": "Sonido estándar actual de Roblox"
  },
  "เสียง Classic \"Oof\" ดั้งเดิม": {
    "en": "Classic Original \"Oof\" Sound",
    "ja": "クラシックな元祖「Oof」サウンド",
    "zh": "经典原版 “Oof” 音效",
    "ko": "오리지널 클래식 \"Oof\" 사운드",
    "es": "Sonido clásico original \"Oof\""
  },
  "เสียง Oof คลาสสิกยอดนิยมของ Roblox": {
    "en": "Popular classic Roblox Oof sound",
    "ja": "大人気のクラシックな Roblox Oof サウンド",
    "zh": "广受喜爱的经典 Roblox Oof 音效",
    "ko": "Roblox의 인기 있는 클래식 Oof 사운드",
    "es": "Sonido clásico Oof popular de Roblox"
  },
  "เสื้อผ้าและของที่ใส่": {
    "en": "Clothing & Equipped Items",
    "ja": "衣類と装備アイテム",
    "zh": "服装和装备道具",
    "ko": "의류 및 장착 아이템",
    "es": "Ropa y objetos equipados"
  },
  "แสงเหนือ": {
    "en": "Aurora",
    "ja": "オーロラ",
    "zh": "极光绿",
    "ko": "오로라",
    "es": "Aurora"
  },
  "แสดงเฉพาะเมื่อมีเกมกำลังเปิดอยู่ (Only When Games Are Running)": {
    "en": "Only When Games Are Running",
    "ja": "ゲーム実行中のみ表示 (Only When Games Are Running)",
    "zh": "仅在游戏运行时显示 (Only When Games Are Running)",
    "ko": "게임이 실행 중일 때만 표시 (Only When Games Are Running)",
    "es": "Solo cuando haya juegos en ejecución"
  },
  "แสดงชื่อเกมและ Place ID": {
    "en": "Show Game Name and Place ID",
    "ja": "ゲーム名と Place ID を表示",
    "zh": "显示游戏名称与 Place ID",
    "ko": "게임 이름 및 Place ID 표시",
    "es": "Mostrar nombre del juego y Place ID"
  },
  "แสดงชื่อแมพที่กำลังเล่นบน Discord Rich Presence": {
    "en": "Show current map name on Discord Rich Presence",
    "ja": "プレイ中のマップ名を Discord Rich Presence に表示",
    "zh": "在 Discord Rich Presence 上显示正在游玩的地图名称",
    "ko": "플레이 중인 맵 이름을 Discord Rich Presence에 표시",
    "es": "Mostrar nombre del mapa en Discord Rich Presence"
  },
  "แสดง/ซ่อน": {
    "en": "Show/Hide",
    "ja": "表示/非表示",
    "zh": "显示/隐藏",
    "ko": "표시/숨기기",
    "es": "Mostrar/Ocultar"
  },
  "แสดง/ซ่อนคีย์": {
    "en": "Show/Hide Key",
    "ja": "キーを表示/非表示",
    "zh": "显示/隐藏密钥",
    "ko": "키 표시/숨기기",
    "es": "Mostrar/Ocultar clave"
  },
  "แสดงตัวนับ FPS ในเกม (In-Game FPS Counter)": {
    "en": "Show In-Game FPS Counter",
    "ja": "ゲーム内FPSカウンターを表示 (In-Game FPS Counter)",
    "zh": "显示游戏内 FPS 计数器 (In-Game FPS Counter)",
    "ko": "게임 내 FPS 카운터 표시 (In-Game FPS Counter)",
    "es": "Mostrar contador de FPS en el juego"
  },
  "แสดงทั้งหมด": {
    "en": "Show All",
    "ja": "すべて表示",
    "zh": "显示全部",
    "ko": "모두 표시",
    "es": "Mostrar todo"
  },
  "แสดงทุกหน้าต่าง Roblox": {
    "en": "Show All Roblox Windows",
    "ja": "すべての Roblox ウィンドウを表示",
    "zh": "显示所有 Roblox 窗口",
    "ko": "모든 Roblox 창 표시",
    "es": "Mostrar todas las ventanas de Roblox"
  },
  "แสดงปุ่มกดลิงก์ภายนอกปุ่มที่สอง (เช่น เข้าร่วมเกม หรือ เข้าดิสคอร์ด)": {
    "en": "Show second external button (e.g. Join Game or Join Discord)",
    "ja": "2つ目の外部リンクボタンを表示 (例: ゲーム参加、Discord参加)",
    "zh": "显示第二个外部链接按钮 (如加入游戏或加入 Discord)",
    "ko": "두 번째 외부 링크 버튼 표시 (예: 게임 참여 또는 디스코드 참가)",
    "es": "Mostrar segundo botón externo (ej. Entrar al juego o al Discord)"
  },
  "แสดงปุ่มกดลิงก์ภายนอกปุ่มแรก": {
    "en": "Show first external button",
    "ja": "1つ目の外部リンクボタンを表示",
    "zh": "显示第一个外部链接按钮",
    "ko": "첫 번째 외부 링크 버튼 표시",
    "es": "Mostrar primer botón externo"
  },
  "แสดงเป็นคำอธิบายสถานะย่อย": {
    "en": "Shown as sub-status description",
    "ja": "サブステータス説明として表示",
    "zh": "显示为副状态描述",
    "ko": "하위 상태 설명으로 표시",
    "es": "Mostrado como descripción secundaria"
  },
  "แสดงเป็นหัวข้อกิจกรรมหลักบน Discord": {
    "en": "Shown as main activity header on Discord",
    "ja": "Discord 上のメインアクティビティとして表示",
    "zh": "显示为 Discord 上的主要活动标题",
    "ko": "Discord의 주요 활동 제목으로 표시됩니다",
    "es": "Se muestra como actividad principal en Discord"
  },
  "แสดงระยะเวลาที่เปิดเล่น (Elapsed Time)": {
    "en": "Show Elapsed Time",
    "ja": "プレイ経過時間を表示 (Elapsed Time)",
    "zh": "显示游玩持续时长 (Elapsed Time)",
    "ko": "플레이 경과 시간 표시 (Elapsed Time)",
    "es": "Mostrar tiempo transcurrido"
  },
  "แสดงสถานะการเล่นเกมและบัญชี MultiRoblox บนโปรไฟล์ Discord ของคุณ": {
    "en": "Display gameplay and MultiRoblox account status on your Discord profile",
    "ja": "ゲームプレイおよび MultiRoblox アカウント状況を Discord プロフィールに表示",
    "zh": "在您的 Discord 个人资料上显示游戏状态与 MultiRoblox 账户信息",
    "ko": "Discord 프로필에 게임 플레이 및 MultiRoblox 계정 상태 표시",
    "es": "Muestra el juego y las cuentas de MultiRoblox en tu perfil de Discord"
  },
  "แสดงสถานะว่ากำลังเล่นเกม Roblox และชื่อแมพในโปรไฟล์ Discord อัตโนมัติ": {
    "en": "Automatically shows Roblox playing status and map name on Discord profile",
    "ja": "Roblox プレイ中ステータスとマップ名を Discord プロフィールに自動表示",
    "zh": "自动在 Discord 个人资料中显示正在玩 Roblox 及地图名称",
    "ko": "Discord 프로필에 Roblox 플레이 상태 및 맵 이름 자동 표시",
    "es": "Muestra que estás jugando a Roblox y el mapa en tu Discord"
  },
  "แสดงหน้าต่างไม่สำเร็จ": {
    "en": "Failed to show window",
    "ja": "ウィンドウの表示に失敗しました",
    "zh": "显示窗口失败",
    "ko": "창 표시 실패",
    "es": "Error al mostrar ventana"
  },
  "แสดงหน้าต่างไม่สำเร็จ:": {
    "en": "Failed to show windows:",
    "ja": "ウィンドウの表示に失敗:",
    "zh": "显示窗口失败:",
    "ko": "창 표시 실패:",
    "es": "Error al mostrar ventanas:"
  },
  "แสดงหน้าต่าง Roblox ทั้งหมด": {
    "en": "Show All Roblox Windows",
    "ja": "すべての Roblox ウィンドウを表示",
    "zh": "显示所有 Roblox 窗口",
    "ko": "모든 Roblox 창 표시",
    "es": "Mostrar todas las ventanas de Roblox"
  },
  "แสดงหน้าต่าง Roblox ทั้งหมด ({0} จอ)": {
    "en": "Show all Roblox windows ({0} windows)",
    "ja": "すべてのRobloxウィンドウを表示 ({0} 画面)",
    "zh": "显示所有 Roblox 窗口 ({0} 个)",
    "ko": "모든 Roblox 창 표시 ({0}개 창)",
    "es": "Mostrar todas las ventanas de Roblox ({0} ventanas)"
  },
  "แสดงหน้าต่าง Roblox ทั้งหมดแล้ว": {
    "en": "All Roblox windows are now shown",
    "ja": "すべての Roblox ウィンドウを表示しました",
    "zh": "已显示全部 Roblox 窗口",
    "ko": "모든 Roblox 창이 표시되었습니다",
    "es": "Todas las ventanas de Roblox mostradas"
  },
  "แสดง Flags ที่ตั้งไว้": {
    "en": "Show Configured Flags",
    "ja": "設定済み Flags を表示",
    "zh": "显示已配置的 Flags",
    "ko": "설정된 Flags 표시",
    "es": "Mostrar Flags configurados"
  },
  "แสดง FPS และ Frame Time ในเกม (In-Game FPS Counter)": {
    "en": "Show In-Game FPS & Frame Time Counter",
    "ja": "ゲーム内FPSとフレームタイムを表示 (In-Game FPS Counter)",
    "zh": "显示游戏内 FPS 和帧时间计数器",
    "ko": "게임 내 FPS 및 프레임 타임 표시 (In-Game FPS Counter)",
    "es": "Mostrar FPS y tiempo de fotograma en el juego"
  },
  "แสดง Roblox ทั้งหมด": {
    "en": "Show All Roblox",
    "ja": "すべての Roblox を表示",
    "zh": "显示全部 Roblox",
    "ko": "모든 Roblox 표시",
    "es": "Mostrar todo Roblox"
  },
  "ใส่คีย์เข้ารหัสของคุณ": {
    "en": "Enter your encryption key",
    "ja": "暗号化キーを入力してください",
    "zh": "输入您的加密密钥",
    "ko": "암호화 키를 입력하세요",
    "es": "Introduce tu clave de cifrado"
  },
  "ใส่คีย์ที่คุณตั้งไว้เพื่อปลดล็อกบัญชีที่บันทึกไว้": {
    "en": "Enter your configured key to unlock saved accounts",
    "ja": "保存されたアカウントをロック解除するために設定したキーを入力",
    "zh": "输入您设置的密钥以解锁保存的账户",
    "ko": "저장된 계정을 잠금 해제하려면 설정한 키를 입력하세요",
    "es": "Introduce tu clave para desbloquear las cuentas guardadas"
  },
  "ใส่คุกกี้โดยตรง รองรับหลายบัญชีพร้อมกัน": {
    "en": "Paste cookies directly (supports multiple accounts at once)",
    "ja": "クッキーを直接入力 (複数アカウントの同時追加対応)",
    "zh": "直接填入 Cookie (支持同时添加多个账户)",
    "ko": "쿠키 직접 입력 (동시에 여러 계정 지원)",
    "es": "Pega cookies directamente (soporta varias cuentas a la vez)"
  },
  "ใส่ตัวเลข FPS เช่น 20 หรือ 60": {
    "en": "Enter FPS target, e.g. 20 or 60",
    "ja": "目標 FPS を入力 (例: 20 または 60)",
    "zh": "输入目标 FPS 数字，例如 20 或 60",
    "ko": "목표 FPS 숫자 입력 (예: 20 또는 60)",
    "es": "Introduce los FPS, ej. 20 o 60"
  },
  "ใส่ Game ID หรือ ลิงก์เซิร์ฟเวอร์เพื่อให้ทุกคนเข้าร่วม": {
    "en": "Enter Game ID or Server link for others to join",
    "ja": "他のプレイヤーが参加できるようにゲームIDまたはサーバーリンクを入力",
    "zh": "输入游戏 ID 或服务器链接以便他人加入",
    "ko": "다른 사람들이 참여할 수 있도록 게임 ID 또는 서버 링크 입력",
    "es": "Introduce Game ID o enlace para que otros se unan"
  },
  "ใส่ Game ID หรือ ลิงก์เซิร์ฟเวอร์เพื่อให้ทุกคนเข้าร่วม…": {
    "en": "Enter Game ID or server link for everyone to join...",
    "ja": "全員が参加するゲームIDまたはサーバーリンクを入力...",
    "zh": "输入 Game ID 或服务器链接以供所有人加入...",
    "ko": "모두가 참여할 게임 ID 또는 서버 링크를 입력하세요...",
    "es": "Introduce el ID de juego o enlace del servidor..."
  },
  "ใส่ ID แอปพลิเคชัน Discord ของคุณเอง (หากต้องการใช้รูปและชื่อแอปที่สร้างเอง)": {
    "en": "Enter your custom Discord Application ID (to use custom assets and application name)",
    "ja": "独自の Discord アプリケーション ID を入力 (カスタム画像やアプリ名を使用する場合)",
    "zh": "输入您自己的 Discord 应用程序 ID (如需使用自定义图标与应用名称)",
    "ko": "직접 생성한 Discord 애플리케이션 ID 입력 (커스텀 이미지 및 앱 이름 사용 시)",
    "es": "Introduce tu propio Discord Application ID (para usar imágenes y nombre personalizados)"
  },
  "ใส่ Place ID หรือลิงก์...": {
    "en": "Enter Place ID or URL...",
    "ja": "Place ID または URL を入力...",
    "zh": "输入 Place ID 或链接...",
    "ko": "Place ID 또는 링크 입력...",
    "es": "Introduce Place ID o enlace..."
  },
  "ใส่ Place ID หรือลิงก์": {
    "en": "Enter Place ID or URL",
    "ja": "Place ID または URL を入力",
    "zh": "输入 Place ID 或链接",
    "ko": "Place ID 또는 링크 입력",
    "es": "Introduce Place ID o enlace"
  },
  "หน่วงเวลาก่อนเริ่มเปิดบัญชีถัดไป (0 ถึง 10 วินาที) สำหรับแบบกลุ่มหรือเลือกหลายตัว": {
    "en": "Cooldown before launching next account (0 to 10s) for batch/multi-launch",
    "ja": "グループまたは複数起動時、次のアカウント起動までの待機時間 (0～10秒)",
    "zh": "批量或多开启动时下一个账户的启动间隔 (0 至 10 秒)",
    "ko": "그룹 또는 다중 실행 시 다음 계정 실행 전 대기 시간 (0~10초)",
    "es": "Intervalo antes de iniciar la siguiente cuenta (0 a 10 s) para paquetes o selección múltiple"
  },
  "หน่วงเวลาระหว่างกดเล็กน้อย": {
    "en": "Slight delay between keypresses",
    "ja": "キー入力間にわずかな待機時間を設ける",
    "zh": "按键之间加入微小延迟",
    "ko": "키 입력 간 약간의 지연 시간 추가",
    "es": "Ligero retardo entre pulsaciones"
  },
  "หน้าเกม": {
    "en": "Game Page",
    "ja": "ゲームページ",
    "zh": "游戏页面",
    "ko": "게임 페이지",
    "es": "Página del juego"
  },
  "หน้าต่าง": {
    "en": "Windows",
    "ja": "ウィンドウ",
    "zh": "窗口",
    "ko": "창",
    "es": "Ventana"
  },
  "หน้าต่างเข้าสู่ระบบถูกปิด": {
    "en": "Login window was closed",
    "ja": "ログインウィンドウが閉じられました",
    "zh": "登录窗口已关闭",
    "ko": "로그인 창이 닫혔습니다",
    "es": "La ventana de inicio de sesión se cerró"
  },
  "หน้าต่างแล้ว": {
    "en": "windows",
    "ja": "画面完了",
    "zh": "个窗口已完成",
    "ko": "개 창 완료",
    "es": "ventanas"
  },
  "หน้าแรก Roblox": {
    "en": "Roblox Home",
    "ja": "Roblox ホーム",
    "zh": "Roblox 首页",
    "ko": "Roblox 홈",
    "es": "Inicio de Roblox"
  },
  "หน้าหลัก": {
    "en": "Home",
    "ja": "ホーム",
    "zh": "主页",
    "ko": "홈",
    "es": "Inicio"
  },
  "หน้าหลัก Roblox": {
    "en": "Roblox Home",
    "ja": "Roblox ホーム",
    "zh": "Roblox 主页",
    "ko": "Roblox 홈",
    "es": "Inicio de Roblox"
  },
  "หมดเวลา": {
    "en": "Timed out",
    "ja": "タイムアウト",
    "zh": "超时",
    "ko": "시간 초과",
    "es": "Tiempo agotado"
  },
  "หมดเวลาดาวน์โหลด (Connection Timeout)": {
    "en": "Download connection timed out",
    "ja": "ダウンロード接続がタイムアウトしました",
    "zh": "下载连接超时 (Connection Timeout)",
    "ko": "다운로드 연결 시간 초과 (Connection Timeout)",
    "es": "Tiempo de descarga agotado (Connection Timeout)"
  },
  "หมดเวลารอเข้าสู่ระบบ กรุณาลองอีกครั้งหรือใช้ \"วางคุกกี้": {
    "en": "Login timed out. Try again or use \"Paste Cookie\".",
    "ja": "ログインがタイムアウトしました。再試行するか「クッキー貼り付け」を使用してください。",
    "zh": "登录超时。请重试或使用“粘贴 Cookie”。",
    "ko": "로그인 대기 시간이 초과되었습니다. 다시 시도하거나 \"쿠키 붙여넣기\"를 사용하세요.",
    "es": "Tiempo de espera agotado. Reintenta o usa \"Pegar cookie\"."
  },
  "หมดเวลารอเข้าสู่ระบบ กรุณาลองอีกครั้งหรือใช้ \"วางคุกกี้\"": {
    "en": "Login timed out. Try again or use \"Paste Cookie\".",
    "ja": "ログインがタイムアウトしました。再試行するか「クッキー貼り付け」を使用してください。",
    "zh": "登录超时。请重试或使用“粘贴 Cookie”。",
    "ko": "로그인 대기 시간이 초과되었습니다. 다시 시도하거나 \"쿠키 붙여넣기\"를 사용하세요.",
    "es": "Tiempo de espera agotado. Reintenta o usa \"Pegar cookie\"."
  },
  "หมดอายุ": {
    "en": "Expired",
    "ja": "期限切れ",
    "zh": "已失效",
    "ko": "만료됨",
    "es": "Expirado"
  },
  "หลายหน้าต่าง Roblox": {
    "en": "Multiple Roblox Windows",
    "ja": "複数 Roblox ウィンドウ",
    "zh": "多窗口 Roblox",
    "ko": "다중 Roblox 창",
    "es": "Múltiples ventanas"
  },
  "หลายอินสแตนซ์": {
    "en": "Multi-Instance",
    "ja": "複数起動",
    "zh": "多开设置",
    "ko": "다중 실행",
    "es": "Multi-instancia"
  },
  "หัวลูกศรเฉียงขอบดำคลาสสิก": {
    "en": "Classic Black-Bordered Arrow",
    "ja": "クラシックな黒枠矢印",
    "zh": "经典黑边斜向箭头",
    "ko": "클래식 블랙 테두리 화살표",
    "es": "Flecha clásica con borde negro"
  },
  "โหมดกำหนดเอง: พิมพ์ข้อความและแท็กได้อิสระ": {
    "en": "Custom Mode: Type any text and template tags freely",
    "ja": "カスタムモード: 任意のテキストとタグを自由に入力可能",
    "zh": "自定义模式: 可自由输入任意文本与模板标签",
    "ko": "사용자 지정 모드: 텍스트와 템플릿 태그를 자유롭게 입력 가능",
    "es": "Modo personalizado: escribe cualquier texto y etiqueta libremente"
  },
  "โหมดความปลอดภัยและการดึงหน้าต่าง (User Safe & Restore)": {
    "en": "User Safe & Window Restore",
    "ja": "セーフモードとウィンドウ復元 (User Safe & Restore)",
    "zh": "安全模式与窗口恢复 (User Safe & Restore)",
    "ko": "안전 모드 및 창 복원 (User Safe & Restore)",
    "es": "Modo seguro y restauración de ventanas"
  },
  "โหมดเซิร์ฟเวอร์": {
    "en": "Server Mode",
    "ja": "サーバーモード",
    "zh": "服务器模式",
    "ko": "서버 모드",
    "es": "Modo de servidor"
  },
  "โหมดเต็มจอแท้ Alt+Enter (Exclusive Fullscreen)": {
    "en": "Exclusive Fullscreen (Alt+Enter)",
    "ja": "排他フルスクリーン (Alt+Enter)",
    "zh": "独占全屏 (Alt+Enter)",
    "ko": "단독 전체화면 (Alt+Enter)",
    "es": "Pantalla completa exclusiva (Alt+Enter)"
  },
  "โหมดเต็มจอ Exclusive Fullscreen": {
    "en": "Exclusive Fullscreen Mode",
    "ja": "排他フルスクリーンモード",
    "zh": "独占全屏模式",
    "ko": "단독 전체화면 모드",
    "es": "Modo pantalla completa exclusiva"
  },
  "โหมดปลอดภัยสำหรับผู้ใช้ (User Safe Mode)": {
    "en": "User Safe Mode",
    "ja": "ユーザーセーフモード (User Safe Mode)",
    "zh": "用户安全模式 (User Safe Mode)",
    "ko": "사용자 안전 모드 (User Safe Mode)",
    "es": "Modo seguro para el usuario"
  },
  "โหมดโมเดลรายละเอียดต่ำ (Low Poly Meshes LOD)": {
    "en": "Low Poly Meshes LOD",
    "ja": "ローポリゴンメッシュ (Low Poly Meshes LOD)",
    "zh": "低精细度网格 (Low Poly Meshes LOD)",
    "ko": "로우 폴리 메시 (Low Poly Meshes LOD)",
    "es": "Mallas de bajo poligonaje LOD"
  },
  "โหลดเกมไม่ได้": {
    "en": "Unable to load game",
    "ja": "ゲームを読み込めません",
    "zh": "无法加载游戏",
    "ko": "게임을 불러올 수 없습니다",
    "es": "No se puede cargar el juego"
  },
  "โหลดข้อมูลล้มเหลว": {
    "en": "Failed to load data",
    "ja": "データの読み込みに失敗しました",
    "zh": "加载数据失败",
    "ko": "데이터 로딩 실패",
    "es": "Error al cargar los datos"
  },
  "โหลดบัญชีจากที่เก็บข้อมูลแล้ว": {
    "en": "Loaded accounts from storage",
    "ja": "ストレージからアカウントを読み込みました",
    "zh": "已从本地存储加载账户",
    "ko": "저장소에서 계정을 불러왔습니다",
    "es": "Cuentas cargadas desde el almacenamiento"
  },
  "โหลดบัญชีจากที่เก็บข้อมูลแล้ว {0} บัญชี": {
    "en": "Loaded {0} accounts from storage",
    "ja": "ストレージから {0} 個のアカウントを読み込みました",
    "zh": "已从存储加载 {0} 个账户",
    "ko": "저장소에서 {0}개 계정을 불러왔습니다",
    "es": "Se cargaron {0} cuentas del almacenamiento"
  },
  "โหลดแมพครบทั้งหมดแล้ว": {
    "en": "All maps loaded",
    "ja": "すべてのマップを読み込みました",
    "zh": "已加载所有地图",
    "ko": "모든 맵 로드 완료",
    "es": "Todos los mapas cargados"
  },
  "โหลดโมเดลล่วงหน้า (Faster Loading Asset Preload)": {
    "en": "Faster Loading Asset Preload",
    "ja": "アセット事前読み込み高速化 (Asset Preload)",
    "zh": "加速素材预载 (Asset Preload)",
    "ko": "빠른 에셋 사전 로드 (Asset Preload)",
    "es": "Precarga de recursos para carga rápida"
  },
  "โหลดรายชื่อเซิร์ฟเวอร์ล้มเหลว": {
    "en": "Failed to load server list",
    "ja": "サーバーリストの読み込みに失敗しました",
    "zh": "加载服务器列表失败",
    "ko": "서버 목록 불러오기 실패",
    "es": "Error al cargar la lista de servidores"
  },
  "โหลดรายชื่อเซิร์ฟเวอร์ล้มเหลว: {0}": {
    "en": "Failed to load server list: {0}",
    "ja": "サーバーリストの読み込みに失敗しました: {0}",
    "zh": "加载服务器列表失败: {0}",
    "ko": "서버 목록 불러오기 실패: {0}",
    "es": "Error al cargar la lista de servidores: {0}"
  },
  "โหลดรูปไม่สำเร็จ": {
    "en": "Failed to load image",
    "ja": "画像の読み込みに失敗しました",
    "zh": "加载图片失败",
    "ko": "이미지 로딩 실패",
    "es": "Error al cargar imagen"
  },
  "โหลดล้มเหลว": {
    "en": "Load failed",
    "ja": "読み込み失敗",
    "zh": "加载失败",
    "ko": "로딩 실패",
    "es": "Carga fallida"
  },
  "โหลดล้มเหลว:": {
    "en": "Loading failed:",
    "ja": "読み込み失敗:",
    "zh": "加载失败:",
    "ko": "불러오기 실패:",
    "es": "Error al cargar:"
  },
  "โหลดล้มเหลว: {0}": {
    "en": "Loading failed: {0}",
    "ja": "読み込み失敗: {0}",
    "zh": "加载失败: {0}",
    "ko": "불러오기 실패: {0}",
    "es": "Error al cargar: {0}"
  },
  "โหลดสคริปต์ครบทั้งหมดแล้ว": {
    "en": "All scripts loaded",
    "ja": "すべてのスクリプトを読み込みました",
    "zh": "所有脚本已加载完毕",
    "ko": "모든 스크립트를 불러왔습니다",
    "es": "Se han cargado todos los scripts"
  },
  "โหลดเสียงกำหนดเองแล้ว": {
    "en": "Custom audio loaded",
    "ja": "カスタム音声を読み込みました",
    "zh": "已加载自定义音频",
    "ko": "사용자 지정 오디오를 불러왔습니다",
    "es": "Audio personalizado cargado"
  },
  "โหลด Mesh เข้าสู่หน่วยความจำล่วงหน้า ลดอาการกระตุกเวลาเคลื่อนที่ในแมพ": {
    "en": "Preload meshes into memory to eliminate stutter while moving through maps",
    "ja": "メッシュをメモリに事前読み込みし、マップ移動時のカクつきを低減",
    "zh": "预先将网格载入内存，大幅减少地图移动时的卡顿掉帧现象",
    "ko": "메시를 메모리에 미리 로드하여 맵 이동 시 버벅거림 현상을 줄입니다",
    "es": "Precarga mallas en memoria para reducir tirones al moverte en el mapa"
  },
  "องุ่น": {
    "en": "Grape Purple",
    "ja": "グレープ",
    "zh": "葡萄紫",
    "ko": "포도색",
    "es": "Uva"
  },
  "อนุญาตให้ดาวน์โหลดโมเดลและแอนิเมชันล่วงหน้าได้ไม่จำกัดจำนวน": {
    "en": "Allows unlimited asset preloading for models and animations",
    "ja": "モデルやアニメーションの事前ダウンロード数を無制限に許可",
    "zh": "允许无限制预载模型与动作动画资源",
    "ko": "모델 및 애니메이션을 무제한으로 사전 로드하도록 허용",
    "es": "Permite precargar modelos y animaciones sin límite"
  },
  "อัตโนมัติ": {
    "en": "Auto",
    "ja": "自動",
    "zh": "自动",
    "ko": "자동",
    "es": "Automático"
  },
  "อัตโนมัติ (Default Engine)": {
    "en": "Auto (Default Engine)",
    "ja": "自動 (エンジン標準)",
    "zh": "自动 (引擎默认)",
    "ko": "자동 (엔진 기본값)",
    "es": "Automático (Motor por defecto)"
  },
  "อัตโนมัติ (Default MSAA)": {
    "en": "Auto (Default MSAA)",
    "ja": "自動 (標準 MSAA)",
    "zh": "自动 (默认 MSAA)",
    "ko": "자동 (기본 MSAA)",
    "es": "Automático (MSAA por defecto)"
  },
  "อัตราเฟรมเป้าหมาย": {
    "en": "Target Frame Rate",
    "ja": "ターゲットフレームレート",
    "zh": "目标帧率",
    "ko": "목표 프레임 레이ท",
    "es": "FPS objetivo"
  },
  "อัปเดต": {
    "en": "Update",
    "ja": "更新",
    "zh": "更新",
    "ko": "업데이트",
    "es": "Actualizar"
  },
  "อัปเดต {0} เรียบร้อยแล้ว": {
    "en": "Updated {0} successfully",
    "ja": "{0} を更新しました",
    "zh": "已更新 {0}",
    "ko": "{0} 업데이트 완료",
    "es": "{0} actualizado con éxito"
  },
  "อัปเดตคุกกี้บัญชีโดยอัตโนมัติเพื่อป้องกันบัญชีหมดอายุ": {
    "en": "Auto refresh account cookies to prevent session expiry",
    "ja": "セッション期限切れを防ぐためアカウントクッキーを自動更新",
    "zh": "自动刷新账户 Cookie 防止凭据过期",
    "ko": "세션 만료를 방지하기 위해 계정 쿠키를 자동으로 갱신합니다",
    "es": "Actualiza automáticamente las cookies para evitar caducidad"
  },
  "อัปเดตคุกกี้ใหม่อัตโนมัติเรียบร้อย": {
    "en": "New cookie updated automatically",
    "ja": "新しいクッキーを自動更新しました",
    "zh": "新 Cookie 已自动更新完成",
    "ko": "새 쿠키가 자동으로 갱신되었습니다",
    "es": "Nueva cookie actualizada automáticamente"
  },
  "อัปโหลดของคุณเอง": {
    "en": "Upload your own",
    "ja": "独自ファイルをアップロード",
    "zh": "上传自定义文件",
    "ko": "직접 업로드",
    "es": "Subir el tuyo"
  },
  "อัปโหลดรูปภาพ .png หรือ .cur ของตัวเอง": {
    "en": "Upload your own .png or .cur image file",
    "ja": "独自の .png または .cur 画像ファイルをアップロード",
    "zh": "上传您自己的 .png 或 .cur 图像文件",
    "ko": "자신의 .png 또는 .cur 이미지 파일 업로드",
    "es": "Sube tu propio archivo de imagen .png o .cur"
  },
  "อัลกอริทึม": {
    "en": "Algorithm",
    "ja": "アルゴリズム",
    "zh": "算法",
    "ko": "알고리즘",
    "es": "Algoritmo"
  },
  "อาร์กิวเมนต์คำสั่งเปิดเกมเพิ่มเติม (Custom Launch Arguments)": {
    "en": "Custom Launch Arguments",
    "ja": "カスタム起動引数 (Custom Launch Arguments)",
    "zh": "自定义启动参数 (Custom Launch Arguments)",
    "ko": "커스텀 실행 인수 (Custom Launch Arguments)",
    "es": "Argumentos de inicio personalizados"
  },
  "อำพัน": {
    "en": "Amber Gold",
    "ja": "アンバー",
    "zh": "琥珀金",
    "ko": "호박색",
    "es": "Ámbar"
  },
  "อินเทอร์เฟซและเมนูในเกม (UI & In-Game Experience)": {
    "en": "UI & In-Game Experience",
    "ja": "UI とゲーム内体験 (UI & In-Game Experience)",
    "zh": "界面与游戏内体验 (UI & In-Game Experience)",
    "ko": "UI 및 인게임 환경 (UI & In-Game Experience)",
    "es": "Interfaz y experiencia en el juego"
  },
  "อินสแตนซ์ Roblox ที่กำลังรัน": {
    "en": "Running Roblox instances",
    "ja": "起動中のRoblox",
    "zh": "正在运行的 Roblox 实例",
    "ko": "실행 중인 Roblox 인스턴스",
    "es": "Instancias de Roblox en ejecución"
  },
  "antiafk] ไม่มี native helper; ไม่สามารถรันกัน AFK ได้": {
    "en": "[antiafk] No native helper; Anti-AFK cannot run",
    "ja": "[antiafk] ネイティブヘルパーがありません。Anti-AFK を実行できません",
    "zh": "[antiafk] 缺少原生助手，无法运行防挂机",
    "ko": "[antiafk] 네이티브 헬퍼가 없어 Anti-AFK를 실행할 수 없습니다",
    "es": "[antiafk] Sin asistente nativo; Anti-AFK no puede ejecutarse"
  },
  "antiafk] เรียกโปรเซสไม่สำเร็จ": {
    "en": "[antiafk] Failed to spawn helper process",
    "ja": "[antiafk] ヘルパープロセスの起動に失敗しました",
    "zh": "[antiafk] 启动助手进程失败",
    "ko": "[antiafk] 헬퍼 프로세스 실행 실패",
    "es": "[antiafk] Error al iniciar proceso auxiliar"
  },
  "auth ticket ผิดพลาด": {
    "en": "auth ticket error",
    "ja": "認証チケットエラー",
    "zh": "认证票据错误",
    "ko": "인증 티켓 오류",
    "es": "Error de auth ticket"
  },
  ": auth ticket ผิดพลาด -": {
    "en": ": auth ticket error -",
    "ja": ": 認証チケットエラー -",
    "zh": ": 认证票据错误 -",
    "ko": ": 인증 티켓 오류 -",
    "es": ": error de auth ticket -"
  },
  "Auto Reset ตัวละคร": {
    "en": "Auto Reset Character",
    "ja": "キャラクター自動リセット",
    "zh": "自动重置角色",
    "ko": "캐릭터 자동 리셋",
    "es": "Reinicio automático de personaje"
  },
  "button ลบ Flag นี้": {
    "en": "Delete this Flag",
    "ja": "この Flag を削除",
    "zh": "删除此 Flag",
    "ko": "이 Flag 삭제",
    "es": "Eliminar este Flag"
  },
  "button ลบ Flag นี้ออกจากโปรไฟล์": {
    "en": "Delete this Flag from profile",
    "ja": "プロファイルからこの Flag を削除",
    "zh": "从配置文件中删除此 Flag",
    "ko": "프로필에서 이 Flag 삭제",
    "es": "Eliminar este Flag del perfil"
  },
  "Direct3D 11 (แนะนำสำหรับ Windows)": {
    "en": "Direct3D 11 (Recommended for Windows)",
    "ja": "Direct3D 11 (Windows 推奨)",
    "zh": "Direct3D 11 (Windows 推荐)",
    "ko": "Direct3D 11 (Windows 권장)",
    "es": "Direct3D 11 (Recomendado para Windows)"
  },
  "Discord เชื่อมต่อแล้ว": {
    "en": "Discord Connected",
    "ja": "Discord 接続済み",
    "zh": "Discord 已连接",
    "ko": "Discord 연결됨",
    "es": "Discord conectado"
  },
  "F12 → Application → Cookies → roblox.com → .ROBLOSECURITY หรือวางล็อกไฟล์ที่มีคุกกี้": {
    "en": "F12 → Application → Cookies → roblox.com → .ROBLOSECURITY or paste log text containing cookies",
    "ja": "F12 → アプリケーション → クッキー → roblox.com → .ROBLOSECURITY、またはクッキーを含むログを貼り付け",
    "zh": "F12 → 应用程序 → Cookie → roblox.com → .ROBLOSECURITY 或粘贴包含 Cookie 的日志文本",
    "ko": "F12 → 애플리케이션 → 쿠키 → roblox.com → .ROBLOSECURITY 또는 쿠키가 포함된 텍스트 붙여넣기",
    "es": "F12 → Aplicación → Cookies → roblox.com → .ROBLOSECURITY o pega texto con cookies"
  },
  "Future is Bright (Phase 3 - สวยงามสมจริง)": {
    "en": "Future is Bright (Phase 3 - Realistic)",
    "ja": "Future is Bright (Phase 3 - リアルで高画質)",
    "zh": "Future is Bright (Phase 3 - 逼真光影)",
    "ko": "Future is Bright (Phase 3 - 사실적 고화질)",
    "es": "Future is Bright (Phase 3 - Realista)"
  },
  "Future is Bright Phase 3, MSAA 4x, Texture คุณภาพสูง เพื่อภาพที่สวยงามและสมจริงที่สุด": {
    "en": "Future is Bright Phase 3, MSAA 4x, high quality textures for stunning realistic graphics",
    "ja": "Future is Bright Phase 3、MSAA 4x、高品質テクスチャで最高の美麗・リアル描画",
    "zh": "Future is Bright Phase 3、MSAA 4x、高清纹理，带来极致唯美逼真的视觉画面",
    "ko": "Future is Bright Phase 3, MSAA 4x, 고품질 텍스처로 가장 아름답고 사실적인 그래픽 구현",
    "es": "Future is Bright Phase 3, MSAA 4x, texturas de alta calidad para gráficos realistas"
  },
  "Integer (ตัวเลขจำนวนเต็ม)": {
    "en": "Integer (Whole Number)",
    "ja": "整数 (Integer)",
    "zh": "整数 (Integer)",
    "ko": "정수 (Integer)",
    "es": "Entero (Número entero)"
  },
  "JSON ว่างเปล่า": {
    "en": "Empty JSON",
    "ja": "空の JSON",
    "zh": "JSON 为空",
    "ko": "빈 JSON",
    "es": "JSON vacío"
  },
  "JSON Syntax: ถูกต้อง": {
    "en": "JSON Syntax: Valid",
    "ja": "JSON 構文: 正常",
    "zh": "JSON 语法: 正确",
    "ko": "JSON 문법: 유효",
    "es": "Sintaxis JSON: Válida"
  },
  "JSON Syntax: รูปแบบไม่ถูกต้อง": {
    "en": "JSON Syntax: Invalid format",
    "ja": "JSON 構文: 無効な形式",
    "zh": "JSON 语法: 格式错误",
    "ko": "JSON 문법: 잘못된 형식",
    "es": "Sintaxis JSON: Formato no válido"
  },
  "migrate] ถอดรหัสไม่สำเร็จ; จะไม่เปลี่ยนแปลงบัญชี": {
    "en": "[migrate] Decryption failed; accounts will not be modified",
    "ja": "[migrate] 復号に失敗しました。アカウントは変更されません",
    "zh": "[migrate] 解密失败；不会对账户进行更改",
    "ko": "[migrate] 복호화 실패; 계정 정보가 변경되지 않습니다",
    "es": "[migrate] Error al descifrar; no se modificarán las cuentas"
  },
  "MSAA 2x (สมดุล)": {
    "en": "MSAA 2x (Balanced)",
    "ja": "MSAA 2x (バランス)",
    "zh": "MSAA 2x (均衡)",
    "ko": "MSAA 2x (균형)",
    "es": "MSAA 2x (Equilibrado)"
  },
  "MSAA 4x (แนะนำเพื่อความคมชัด)": {
    "en": "MSAA 4x (Recommended for clarity)",
    "ja": "MSAA 4x (鮮明さ推奨)",
    "zh": "MSAA 4x (推荐清晰度)",
    "ko": "MSAA 4x (선명도 권장)",
    "es": "MSAA 4x (Recomendado para nitidez)"
  },
  "MSAA 8x (สูงสุด)": {
    "en": "MSAA 8x (Maximum)",
    "ja": "MSAA 8x (最高品質)",
    "zh": "MSAA 8x (最高)",
    "ko": "MSAA 8x (최대)",
    "es": "MSAA 8x (Máximo)"
  },
  "OpenGL (เข้ากันได้กับระบบเก่า)": {
    "en": "OpenGL (Legacy Compatibility)",
    "ja": "OpenGL (レガシー互換)",
    "zh": "OpenGL (兼容旧系统)",
    "ko": "OpenGL (구형 시스템 호환)",
    "es": "OpenGL (Compatibilidad heredada)"
  },
  "OpenGL (ทางเลือกสำหรับไดรเวอร์เก่า)": {
    "en": "OpenGL (Alternative for older drivers)",
    "ja": "OpenGL (レガシードライバー向け)",
    "zh": "OpenGL (老旧驱动替代选项)",
    "ko": "OpenGL (구형 드라이버용 대체 옵션)",
    "es": "OpenGL (alternativa para drivers antiguos)"
  },
  "Roblox Official (ค่าเริ่มต้น)": {
    "en": "Roblox Official (Default)",
    "ja": "Roblox 公式 (デフォルト)",
    "zh": "Roblox 官方 (默认)",
    "ko": "Roblox 공식 (기본값)",
    "es": "Roblox Oficial (Predeterminado)"
  },
  "Roblox Player Live Build (แนะนำ)": {
    "en": "Roblox Player Live Build (Recommended)",
    "ja": "Roblox Player Live Build (推奨)",
    "zh": "Roblox Player Live Build (推荐)",
    "ko": "Roblox Player Live Build (권장)",
    "es": "Roblox Player Live Build (Recomendado)"
  },
  "Robux (ยอดเงิน)": {
    "en": "Robux (Balance)",
    "ja": "Robux (残高)",
    "zh": "Robux (余额)",
    "ko": "Robux (잔액)",
    "es": "Robux (Saldo)"
  },
  "SetForegroundWindow (แนะนำ)": {
    "en": "SetForegroundWindow (Recommended)",
    "ja": "SetForegroundWindow (推奨)",
    "zh": "SetForegroundWindow (推荐)",
    "ko": "SetForegroundWindow (권장)",
    "es": "SetForegroundWindow (Recomendado)"
  },
  "Shadow Map (Phase 2 - สมดุล)": {
    "en": "Shadow Map (Phase 2 - Balanced)",
    "ja": "Shadow Map (Phase 2 - バランス)",
    "zh": "Shadow Map (Phase 2 - 性能平衡)",
    "ko": "Shadow Map (Phase 2 - 균형)",
    "es": "Shadow Map (Phase 2 - Equilibrado)"
  },
  "ShadowMap (Phase 2 - สมดุล)": {
    "en": "ShadowMap (Phase 2 - Balanced)",
    "ja": "ShadowMap (Phase 2 - バランス)",
    "zh": "ShadowMap (Phase 2 - 性能平衡)",
    "ko": "ShadowMap (Phase 2 - 균형)",
    "es": "ShadowMap (Phase 2 - Equilibrado)"
  },
  "Snap Grid (ดึงกลับตำแหน่งเดิม)": {
    "en": "Snap Grid (Reset to saved coordinates)",
    "ja": "スナップグリッド (元の位置に復元)",
    "zh": "网格吸附 (还原到原位置)",
    "ko": "스냅 그리드 (원래 위치로 복원)",
    "es": "Ajustar a cuadrícula (restaurar posición original)"
  },
  "String (ข้อความ)": {
    "en": "String (Text)",
    "ja": "文字列 (String)",
    "zh": "字符串 (String)",
    "ko": "문자열 (String)",
    "es": "Cadena (Texto)"
  },
  "true)\">ดู/แก้ไข": {
    "en": "View/Edit",
    "ja": "表示/編集",
    "zh": "查看/编辑",
    "ko": "보기/편집",
    "es": "Ver/Editar"
  },
  "', true)\">ดู/แก้ไข <button": {
    "en": "View/Edit",
    "ja": "表示/編集",
    "zh": "查看/编辑",
    "ko": "보기/편집",
    "es": "Ver/Editar"
  },
  "UI ปัจจุบัน 2023+ (Modern In-Game Menu)": {
    "en": "Modern In-Game Menu (2023+)",
    "ja": "現代版インゲームメニュー (2023+)",
    "zh": "现代游戏内菜单 (2023+)",
    "ko": "최신 인게임 메뉴 (2023+)",
    "es": "Menú moderno en el juego (2023+)"
  },
  "UI Roblox ดั้งเดิม 2020 (Classic UI)": {
    "en": "Classic 2020 Roblox UI",
    "ja": "2020年クラシック Roblox UI",
    "zh": "2020 经典 Roblox 界面",
    "ko": "2020 클래식 Roblox UI",
    "es": "UI clásica de Roblox 2020"
  },
  "URL ของ Discord Webhook": {
    "en": "Discord Webhook URL",
    "ja": "Discord Webhook URL",
    "zh": "Discord Webhook URL",
    "ko": "Discord Webhook URL",
    "es": "URL de Discord Webhook"
  },
  "Voxel (Phase 1 - เบาเครื่อง)": {
    "en": "Voxel (Phase 1 - Performance)",
    "ja": "Voxel (Phase 1 - 軽量)",
    "zh": "Voxel (Phase 1 - 低占用)",
    "ko": "Voxel (Phase 1 - 가벼움)",
    "es": "Voxel (Phase 1 - Rendimiento)"
  },
  "Vulkan (ประสิทธิภาพสูงบนการ์ดจอสมัยใหม่)": {
    "en": "Vulkan (High performance on modern GPUs)",
    "ja": "Vulkan (最新GPU向け高パフォーマンス)",
    "zh": "Vulkan (现代显卡高性能)",
    "ko": "Vulkan (최신 그래픽카드 고성능)",
    "es": "Vulkan (alto rendimiento en GPUs modernas)"
  },
  "Vulkan (ลด CPU Overhead)": {
    "en": "Vulkan (Reduced CPU Overhead)",
    "ja": "Vulkan (CPUオーバーヘッド削減)",
    "zh": "Vulkan (降低 CPU 开销)",
    "ko": "Vulkan (CPU 오버헤드 감소)",
    "es": "Vulkan (Reduce uso de CPU)"
  }
};

// Dynamic regex-based translation rules for runtime parameterized strings
const DYNAMIC_RULES = [
  {
    regex: /^โหลดบัญชีจากที่เก็บข้อมูลแล้ว\s+(.+)\s+บัญชี$/,
    trans: {
      en: 'Loaded {0} accounts from storage',
      ja: 'ストレージから {0} 個のアカウントを読み込みました',
      zh: '已从存储加载 {0} 个账户',
      ko: '저장소에서 {0}개 계정을 불러왔습니다',
      es: 'Se cargaron {0} cuentas del almacenamiento'
    }
  },
  {
    regex: /^เปิดกัน\s*AFK\s*ไว้ตอนเริ่มต้น\s*\(กำลังทำงาน:\s*(.+)\)$/,
    trans: {
      en: 'Anti-AFK enabled on startup (Active: {0})',
      ja: '起動時にAnti-AFKを有効化 (動作中: {0})',
      zh: '启动时已启用防挂机 (运行中: {0})',
      ko: '시작 시 Anti-AFK 활성화됨 (실행 중: {0})',
      es: 'Anti-AFK activado al inicio (Activo: {0})'
    }
  },
  {
    regex: /^ปิด\s*Roblox\s*สำหรับ\s+(.+)\s+แล้ว$/,
    trans: {
      en: 'Closed Roblox for {0}',
      ja: '{0} のRobloxを終了しました',
      zh: '已为 {0} 关闭 Roblox',
      ko: '{0}의 Roblox를 종료했습니다',
      es: 'Roblox cerrado para {0}'
    }
  },
  {
    regex: /^บัญชี\s+(.+)\s+ปิดการทำงานหรือหลุดการเชื่อมต่อ$/,
    trans: {
      en: 'Account {0} closed or disconnected',
      ja: 'アカウント {0} が終了または切断されました',
      zh: '账户 {0} 已关闭或断开连接',
      ko: '계정 {0}이(가) 종료되었거나 연결이 끊어졌습니다',
      es: 'La cuenta {0} se ha cerrado o desconectado'
    }
  },
  {
    regex: /^ไม่สามารถยกเลิกรหัสผ่านได้:\s*(.*)$/,
    trans: {
      en: 'Unable to remove password: {0}',
      ja: 'パスワードを解除できませんでした: {0}',
      zh: '无法取消密码: {0}',
      ko: '비밀번호를 해제할 수 없습니다: {0}',
      es: 'No se pudo quitar la contraseña: {0}'
    }
  },
  {
    regex: /^กำหนดเอง\s*\((.+)\s*FPS\)$/,
    trans: {
      en: 'Custom ({0} FPS)',
      ja: 'カスタム ({0} FPS)',
      zh: '自定义 ({0} FPS)',
      ko: '사용자 지정 ({0} FPS)',
      es: 'Personalizado ({0} FPS)'
    }
  },
  {
    regex: /^กำลังดาวน์โหลดเวอร์ชัน\s+(.+)\s+จาก\s*Roblox CDN\.\.\.$/,
    trans: {
      en: 'Downloading version {0} from Roblox CDN...',
      ja: 'Roblox CDNからバージョン {0} をダウンロード中...',
      zh: '正在从 Roblox CDN 下载版本 {0}...',
      ko: 'Roblox CDN에서 버전 {0} 다운로드 중...',
      es: 'Descargando versión {0} de Roblox CDN...'
    }
  },
  {
    regex: /^ดาวน์โหลดไปแล้ว\s+(.+)%$/,
    trans: {
      en: 'Downloaded {0}%',
      ja: 'ダウンロード完了 {0}%',
      zh: '已下载 {0}%',
      ko: '{0}% 다운로드됨',
      es: 'Descargado {0}%'
    }
  },
  {
    regex: /^กำลังปิดอินสแตนซ์\s*Roblox\s*ของ\s+(.+)\.\.\.$/,
    trans: {
      en: 'Closing Roblox instance for {0}...',
      ja: '{0} のRobloxインスタンスを終了中...',
      zh: '正在关闭 {0} 的 Roblox 实例...',
      ko: '{0}의 Roblox 인스턴스 종료 중...',
      es: 'Cerrando instancia de Roblox de {0}...'
    }
  },
  {
    regex: /^ปิดอินสแตนซ์ของ\s+(.+)\s+แล้ว$/,
    trans: {
      en: 'Closed instance for {0}',
      ja: '{0} のインスタンスを終了しました',
      zh: '已关闭 {0} 的实例',
      ko: '{0}의 인스턴스를 종료했습니다',
      es: 'Instancia cerrada para {0}'
    }
  },
  {
    regex: /^เชื่อมต่อหน้าเว็บ\s*Roblox\s*ไม่สำเร็จ\s*\((.*)$/,
    trans: {
      en: 'Failed to connect to Roblox website ({0}',
      ja: 'Roblox Webサイトへの接続に失敗しました ({0}',
      zh: '连接 Roblox 网页失败 ({0}',
      ko: 'Roblox 웹사이트 연결 실패 ({0}',
      es: 'Error al conectar con la web de Roblox ({0}'
    }
  },
  {
    regex: /^กำลังตรวจสอบและเพิ่มบัญชี\s*\((.+)\s*รายการ\)\.\.\.$/,
    trans: {
      en: 'Verifying and adding accounts ({0} items)...',
      ja: 'アカウントを確認して追加中 ({0} 件)...',
      zh: '正在验证并添加账户 ({0} 项)...',
      ko: '계정 확인 및 추가 중 ({0}개)...',
      es: 'Verificando y agregando cuentas ({0} elementos)...'
    }
  },
  {
    regex: /^กำลังตรวจสอบและเพิ่มบัญชี\s+(.+)\.\.\.$/,
    trans: {
      en: 'Verifying and adding account {0}...',
      ja: 'アカウント {0} を確認して追加中...',
      zh: '正在验证并添加账户 {0}...',
      ko: '계정 {0} 확인 및 추가 중...',
      es: 'Verificando y agregando cuenta {0}...'
    }
  },
  {
    regex: /^นำเข้าสำเร็จ\s+(.+)\s+บัญชี\s*\(ล้มเหลว\s+(.+)\)$/,
    trans: {
      en: 'Imported {0} accounts successfully ({1} failed)',
      ja: '{0} アカウントのインポートに成功 ({1} 失敗)',
      zh: '成功导入 {0} 个账户 (失败 {1} 个)',
      ko: '{0}개 계정 가져오기 성공 ({1}개 실패)',
      es: 'Se importaron {0} cuentas con éxito ({1} fallidas)'
    }
  },
  {
    regex: /^นำเข้าสำเร็จ\s+(.+)\s+บัญชี$/,
    trans: {
      en: 'Imported {0} accounts successfully',
      ja: '{0} アカウントのインポートに成功',
      zh: '成功导入 {0} 个账户',
      ko: '{0}개 계정 가져오기 성공',
      es: 'Se importaron {0} cuentas con éxito'
    }
  },
  {
    regex: /^นำเข้าล้มเหลวทุกบัญชี\s*\((.+)\s*บัญชี\)$/,
    trans: {
      en: 'Failed to import all accounts ({0} accounts)',
      ja: 'すべてのアカウントのインポートに失敗 ({0} 件)',
      zh: '所有账户导入失败 ({0} 个账户)',
      ko: '모든 계정 가져오기 실패 ({0}개 계정)',
      es: 'Error al importar todas las cuentas ({0} cuentas)'
    }
  },
  {
    regex: /^กำลังเปิด\s*Roblox\s*สำหรับ\s+(.+)\s*\(กลุ่ม\)\.\.\.$/,
    trans: {
      en: 'Launching Roblox for {0} (Package)...',
      ja: '{0} のRobloxを起動中 (パッケージ)...',
      zh: '正在为 {0} 启动 Roblox (群组)...',
      ko: '{0}의 Roblox 실행 중 (그룹)...',
      es: 'Iniciando Roblox para {0} (Grupo)...'
    }
  },
  {
    regex: /^เปิด\s*Roblox\s*แล้วในชื่อ\s+(.+)\s*\(กลุ่ม\)$/,
    trans: {
      en: 'Roblox launched as {0} (Package)',
      ja: '{0} としてRobloxを起動しました (パッケージ)',
      zh: '已以 {0} 身份启动 Roblox (群组)',
      ko: '{0}(으)로 Roblox 실행 완료 (그룹)',
      es: 'Roblox iniciado como {0} (Grupo)'
    }
  },
  {
    regex: /^กำลังเปิด\s*Roblox\s*สำหรับ\s+(.+)\s+เข้าแมพ\s+(.+)\.\.\.$/,
    trans: {
      en: 'Launching Roblox for {0} into map {1}...',
      ja: '{0} をマップ {1} に起動中...',
      zh: '正在为 {0} 启动 Roblox 进入地图 {1}...',
      ko: '{0}의 Roblox를 맵 {1}으로 실행 중...',
      es: 'Iniciando Roblox para {0} en el mapa {1}...'
    }
  },
  {
    regex: /^เปิด\s*Roblox\s*แล้วในชื่อ\s+(.+)\s+เข้าแมพ\s+(.+)$/,
    trans: {
      en: 'Roblox launched as {0} into map {1}',
      ja: '{0} としてマップ {1} にRobloxを起動しました',
      zh: '已以 {0} 身份启动 Roblox 进入地图 {1}',
      ko: '{0}(으)로 맵 {1}에 Roblox 실행 완료',
      es: 'Roblox iniciado como {0} en el mapa {1}'
    }
  },
  {
    regex: /^กำลังเปิด\s*Roblox\s*สำหรับ\s+(.+)\.\.\.$/,
    trans: {
      en: 'Launching Roblox for {0}...',
      ja: '{0} のRobloxを起動中...',
      zh: '正在为 {0} 启动 Roblox...',
      ko: '{0}의 Roblox 실행 중...',
      es: 'Iniciando Roblox para {0}...'
    }
  },
  {
    regex: /^เปิด\s*Roblox\s*สำเร็จในชื่อ\s+(.+)$/,
    trans: {
      en: 'Roblox launched successfully as {0}',
      ja: '{0} としてRobloxの起動に成功しました',
      zh: '已成功以 {0} 身份启动 Roblox',
      ko: '{0}(으)로 Roblox 실행 성공',
      es: 'Roblox iniciado con éxito como {0}'
    }
  },
  {
    regex: /^เปิดไม่สำเร็จสำหรับ\s+(.+):\s*(.*)$/,
    trans: {
      en: 'Launch failed for {0}: {1}',
      ja: '{0} の起動に失敗: {1}',
      zh: '{0} 启动失败: {1}',
      ko: '{0} 실행 실패: {1}',
      es: 'Error al iniciar para {0}: {1}'
    }
  },
  {
    regex: /^เลือกเซิร์ฟเวอร์เป้าหมายสำเร็จ:\s*Job ID\s+(.+)\s*\(ผู้เล่น:\s*(.+)\/(.+),\s*ปิง:\s*(.+)ms\)$/,
    trans: {
      en: 'Target server selected: Job ID {0} (Players: {1}/{2}, Ping: {3}ms)',
      ja: 'ターゲットサーバー選択成功: Job ID {0} (プレイヤー: {1}/{2}, ping: {3}ms)',
      zh: '已成功选择目标服务器: Job ID {0} (玩家: {1}/{2}, 延迟: {3}ms)',
      ko: '대상 서버 선택 완료: Job ID {0} (플레이어: {1}/{2}, 핑: {3}ms)',
      es: 'Servidor seleccionado: Job ID {0} (Jugadores: {1}/{2}, Ping: {3}ms)'
    }
  },
  {
    regex: /^ไม่พบเซิร์ฟเวอร์ที่ตรงตามเงื่อนไข\s*(.+)\s*สำหรับ\s*(.+)\s*บัญชี,\s*รันในโหมดจับคู่ปกติ$/,
    trans: {
      en: 'No server matching {0} for {1} accounts, running in normal matchmaking mode',
      ja: '{1} アカウントの条件 {0} に一致するサーバーが見つかりません。通常マッチングで実行します',
      zh: '未找到符合条件 {0} 的服务器（针对 {1} 个账户），使用普通匹配模式运行',
      ko: '{1}개 계정에 대한 조건 {0}에 맞는 서버가 없습니다. 일반 매칭 모드로 실행합니다',
      es: 'No se encontró un servidor para {0} con {1} cuentas, iniciando emparejamiento normal'
    }
  },
  {
    regex: /^โหลดรายชื่อเซิร์ฟเวอร์ล้มเหลว:\s*(.*)$/,
    trans: {
      en: 'Failed to load server list: {0}',
      ja: 'サーバーリストの読み込みに失敗しました: {0}',
      zh: '加载服务器列表失败: {0}',
      ko: '서버 목록 불러오기 실패: {0}',
      es: 'Error al cargar la lista de servidores: {0}'
    }
  },
  {
    regex: /^(\d+)\s*บัญชี$/,
    trans: {
      en: '{0} accounts',
      ja: '{0} アカウント',
      zh: '{0} 个账户',
      ko: '{0}개 계정',
      es: '{0} cuentas'
    }
  },
  {
    regex: /^จัดระเบียบหน้าต่าง\s*Roblox\s*(.+)\s*จอเข้าพิกัดเรียบร้อย!$/,
    trans: {
      en: 'Organized {0} Roblox windows into grid coordinates!',
      ja: '{0} 個のRobloxウィンドウをグリッド座標に整列しました！',
      zh: '已将 {0} 个 Roblox 窗口整理到网格坐标！',
      ko: '{0}개의 Roblox 창을 그리드 좌표로 정리했습니다!',
      es: '¡{0} ventanas de Roblox organizadas en cuadrícula!'
    }
  },
  {
    regex: /^จัดเรียงหน้าต่าง\s*(.+)\s*จอเรียบร้อยแล้ว$/,
    trans: {
      en: 'Arranged {0} windows successfully',
      ja: '{0} 個のウィンドウを整列しました',
      zh: '已成功排列 {0} 个窗口',
      ko: '{0}개 창 정렬 완료',
      es: '{0} ventanas organizadas con éxito'
    }
  },
  {
    regex: /^แสดงหน้าต่าง\s*Roblox\s*ทั้งหมด\s*\((.+)\s*จอ\)$/,
    trans: {
      en: 'Show all Roblox windows ({0} windows)',
      ja: 'すべてのRobloxウィンドウを表示 ({0} 画面)',
      zh: '显示所有 Roblox 窗口 ({0} 个)',
      ko: '모든 Roblox 창 표시 ({0}개 창)',
      es: 'Mostrar todas las ventanas de Roblox ({0} ventanas)'
    }
  },
  {
    regex: /^ซ่อนหน้าต่าง\s*Roblox\s*ทั้งหมด\s*\((.+)\s*จอ\)$/,
    trans: {
      en: 'Hide all Roblox windows ({0} windows)',
      ja: 'すべてのRobloxウィンドウを非表示 ({0} 画面)',
      zh: '隐藏所有 Roblox 窗口 ({0} 个)',
      ko: '모든 Roblox 창 숨기기 ({0}개 창)',
      es: 'Ocultar todas las ventanas de Roblox ({0} ventanas)'
    }
  },
  {
    regex: /^ตรวจพบและ\s*Reconnect\s*(.+)\s*หน้าต่างแล้ว$/,
    trans: {
      en: 'Detected and reconnected {0} windows',
      ja: '{0} 個のウィンドウを検出して再接続しました',
      zh: '已检测并重新连接 {0} 个窗口',
      ko: '{0}개 창 감지 및 재연결 완료',
      es: 'Se detectaron y reconectaron {0} ventanas'
    }
  },
  {
    regex: /^รีเซ็ตตัวละครสำเร็จ\s*\((.+)\s*จอ\)$/,
    trans: {
      en: 'Character reset successfully ({0} windows)',
      ja: 'キャラクターのリセットに成功 ({0} 画面)',
      zh: '角色重置成功 ({0} 个窗口)',
      ko: '캐릭터 리셋 성공 ({0}개 창)',
      es: 'Personaje reiniciado con éxito ({0} ventanas)'
    }
  },
  {
    regex: /^ปรับใช้โปรไฟล์\s*(.+)\s*สำเร็จแล้ว$/,
    trans: {
      en: 'Applied profile {0} successfully',
      ja: 'プロファイル {0} を適用しました',
      zh: '已成功应用配置文件 {0}',
      ko: '프로필 {0} 적용 완료',
      es: 'Perfil {0} aplicado con éxito'
    }
  },
  {
    regex: /^บันทึกโปรไฟล์\s*(.+)\s*เรียบร้อยแล้ว$/,
    trans: {
      en: 'Saved profile {0} successfully',
      ja: 'プロファイル {0} を保存しました',
      zh: '已保存配置文件 {0}',
      ko: '프로필 {0} 저장 완료',
      es: 'Perfil {0} guardado con éxito'
    }
  },
  {
    regex: /^ลบโปรไฟล์\s*(.+)\s*เรียบร้อยแล้ว$/,
    trans: {
      en: 'Deleted profile {0} successfully',
      ja: 'プロファイル {0} を削除しました',
      zh: '已删除配置文件 {0}',
      ko: '프로필 {0} 삭제 완료',
      es: 'Perfil {0} eliminado con éxito'
    }
  },
  {
    regex: /^นำเข้า\s*FastFlags\s*จาก\s+(.+)\s*เรียบร้อยแล้ว$/,
    trans: {
      en: 'Imported FastFlags from {0} successfully',
      ja: '{0} からFastFlagsをインポートしました',
      zh: '已成功从 {0} 导入 FastFlags',
      ko: '{0}에서 FastFlags를 가져왔습니다',
      es: 'FastFlags importados de {0} con éxito'
    }
  },
  {
    regex: /^โปรไฟล์:\s*(.+)$/,
    trans: {
      en: 'Profile: {0}',
      ja: 'プロファイル: {0}',
      zh: '配置文件: {0}',
      ko: '프로필: {0}',
      es: 'Perfil: {0}'
    }
  },
  {
    regex: /^ระบุค่าสำหรับ\s*(.+):$/,
    trans: {
      en: 'Specify value for {0}:',
      ja: '{0} の値を入力:',
      zh: '指定 {0} 的值:',
      ko: '{0}의 값 지정:',
      es: 'Especificar valor para {0}:'
    }
  },
  {
    regex: /^เพิ่ม\s*(.+)\s*ลงในโปรไฟล์แล้ว$/,
    trans: {
      en: 'Added {0} to profile',
      ja: '{0} をプロファイルに追加しました',
      zh: '已添加 {0} 到配置文件',
      ko: '{0}을(를) 프로필에 추가했습니다',
      es: '{0} añadido al perfil'
    }
  },
  {
    regex: /^ปรับใช้โปรไฟล์\s*(.+)\s*ไปยัง\s*Roblox\s*แล้ว$/,
    trans: {
      en: 'Applied profile {0} to Roblox',
      ja: 'プロファイル {0} をRobloxに適用しました',
      zh: '已将配置文件 {0} 应用到 Roblox',
      ko: '프로필 {0}을(를) Roblox에 적용했습니다',
      es: 'Perfil {0} aplicado a Roblox'
    }
  },
  {
    regex: /^ต้องการลบ\s*FastFlags\s*ที่เลือกไว้จำนวน\s*(.+)\s*รายการหรือไม่\?$/,
    trans: {
      en: 'Do you want to delete {0} selected FastFlags?',
      ja: '選択した {0} 件のFastFlagsを削除しますか？',
      zh: '是否删除选中的 {0} 个 FastFlags？',
      ko: '선택한 {0}개의 FastFlags를 삭제하시겠습니까?',
      es: '¿Eliminar los {0} FastFlags seleccionados?'
    }
  },
  {
    regex: /^คุณแน่ใจหรือไม่ว่าต้องการลบ\s*FastFlags\s*ทั้งหมด\s*\((.+)\s*รายการ\)\?$/,
    trans: {
      en: 'Are you sure you want to delete all FastFlags ({0} items)?',
      ja: 'すべてのFastFlags ({0} 件) を削除してもよろしいですか？',
      zh: '您确定要删除所有 FastFlags（{0} 项）吗？',
      ko: '모든 FastFlags({0}개 항목)를 삭제하시겠습니까?',
      es: '¿Seguro que deseas eliminar todos los FastFlags ({0} elementos)?'
    }
  },
  {
    regex: /^อัปเดต\s*(.+)\s*เรียบร้อยแล้ว$/,
    trans: {
      en: 'Updated {0} successfully',
      ja: '{0} を更新しました',
      zh: '已更新 {0}',
      ko: '{0} 업데이트 완료',
      es: '{0} actualizado con éxito'
    }
  },
  {
    regex: /^ลบ\s*(.+)\s*แล้ว$/,
    trans: {
      en: 'Deleted {0}',
      ja: '{0} を削除しました',
      zh: '已删除 {0}',
      ko: '{0} 삭제됨',
      es: '{0} eliminado'
    }
  },
  {
    regex: /^เพิ่ม\s*FastFlag\s*(.+)\s*สำเร็จแล้ว$/,
    trans: {
      en: 'Added FastFlag {0} successfully',
      ja: 'FastFlag {0} を追加しました',
      zh: '成功添加 FastFlag {0}',
      ko: 'FastFlag {0} 추가 성공',
      es: 'FastFlag {0} añadido con éxito'
    }
  },
  {
    regex: /^เพิ่ม\s*(.+)\s*ลงใน\s*ClientAppSettings\s*แล้ว$/,
    trans: {
      en: 'Added {0} to ClientAppSettings',
      ja: '{0} をClientAppSettingsに追加しました',
      zh: '已添加 {0} 到 ClientAppSettings',
      ko: '{0}을(를) ClientAppSettings에 추가했습니다',
      es: '{0} añadido a ClientAppSettings'
    }
  },
  {
    regex: /^ติดตั้ง\s*Mods\s*เรียบร้อยแล้ว\s*\(คัดลอก\s*(.+)\s*ไฟล์\)$/,
    trans: {
      en: 'Mods installed successfully (copied {0} files)',
      ja: 'Modをインストールしました ({0} ファイルをコピー)',
      zh: 'Mod 安装完成 (已复制 {0} 个文件)',
      ko: '모드 설치 완료 ({0}개 파일 복사됨)',
      es: 'Mods instalados con éxito (copiados {0} archivos)'
    }
  },
  {
    regex: /^ไม่พบสคริปต์ที่ตรงกับ\s*"(.*)"$/,
    trans: {
      en: 'No scripts found matching "{0}"',
      ja: '「{0}」に一致するスクリプトが見つかりません',
      zh: '未找到与“{0}”匹配的脚本',
      ko: '"{0}"과(와) 일치하는 스크립트를 찾을 수 없습니다',
      es: 'No se encontraron scripts que coincidan con "{0}"'
    }
  },
  {
    regex: /^โหลดล้มเหลว:\s*(.*)$/,
    trans: {
      en: 'Loading failed: {0}',
      ja: '読み込みに失敗しました: {0}',
      zh: '加载失败: {0}',
      ko: '불러오기 실패: {0}',
      es: 'Error al cargar: {0}'
    }
  }
];

const PREFIX_RULES = [
  { prefix: 'จัดเรียงหน้าต่างไม่สำเร็จ:', trans: { en: 'Failed to arrange windows:', ja: 'ウィンドウの整列に失敗:', zh: '排列窗口失败:', ko: '창 정렬 실패:', es: 'Error al organizar ventanas:' } },
  { prefix: 'ตั้งค่าความโปร่งใสไม่สำเร็จ:', trans: { en: 'Failed to set transparency:', ja: '透明度の設定に失敗:', zh: '设置透明度失败:', ko: '투명도 설정 실패:', es: 'Error al configurar transparencia:' } },
  { prefix: 'แสดงหน้าต่างไม่สำเร็จ:', trans: { en: 'Failed to show windows:', ja: 'ウィンドウの表示に失敗:', zh: '显示窗口失败:', ko: '창 표시 실패:', es: 'Error al mostrar ventanas:' } },
  { prefix: 'ซ่อนหน้าต่างไม่สำเร็จ:', trans: { en: 'Failed to hide windows:', ja: 'ウィンドウの非表示に失敗:', zh: '隐藏窗口失败:', ko: '창 숨기기 실패:', es: 'Error al ocultar ventanas:' } },
  { prefix: 'ทดสอบไม่สำเร็จ:', trans: { en: 'Test failed:', ja: 'テストに失敗:', zh: '测试失败:', ko: '테스트 실패:', es: 'Error en la prueba:' } },
  { prefix: 'ตรวจสอบการเชื่อมต่อล้มเหลว:', trans: { en: 'Connection check failed:', ja: '接続確認に失敗:', zh: '检查连接失败:', ko: '연결 확인 실패:', es: 'Error al verificar conexión:' } },
  { prefix: 'รีเซ็ตตัวละครไม่สำเร็จ:', trans: { en: 'Failed to reset character:', ja: 'キャラクターのリセットに失敗:', zh: '重置角色失败:', ko: '캐릭터 리셋 실패:', es: 'Error al reiniciar personaje:' } },
  { prefix: 'เกิดข้อผิดพลาด:', trans: { en: 'Error occurred:', ja: 'エラーが発生しました:', zh: '发生错误:', ko: '오류 발생:', es: 'Ocurrió un error:' } },
  { prefix: 'บันทึกโปรไฟล์ไม่สำเร็จ:', trans: { en: 'Failed to save profile:', ja: 'プロファイルの保存に失敗:', zh: '保存配置文件失败:', ko: '프로필 저장 실패:', es: 'Error al guardar perfil:' } },
  { prefix: 'ส่งออกไฟล์ล้มเหลว:', trans: { en: 'Failed to export file:', ja: 'ファイルのエクスポートに失敗:', zh: '导出文件失败:', ko: '파일 내보내기 실패:', es: 'Error al exportar archivo:' } },
  { prefix: 'นำเข้าไฟล์ล้มเหลว:', trans: { en: 'Failed to import file:', ja: 'ファイルのインポートに失敗:', zh: '导入文件失败:', ko: '파일 가져오기 실패:', es: 'Error al importar archivo:' } },
  { prefix: 'เปิดโปรไฟล์ไม่สำเร็จ:', trans: { en: 'Failed to open profile:', ja: 'プロファイルを開けませんでした:', zh: '打开配置文件失败:', ko: '프로필 열기 실패:', es: 'Error al abrir perfil:' } },
  { prefix: 'ปรับใช้โปรไฟล์ล้มเหลว:', trans: { en: 'Failed to apply profile:', ja: 'プロファイルの適用に失敗:', zh: '应用配置文件失败:', ko: '프로필 적용 실패:', es: 'Error al aplicar perfil:' } },
  { prefix: 'คัดลอกไม่สำเร็จ:', trans: { en: 'Failed to copy:', ja: 'コピーに失敗:', zh: '复制失败:', ko: '복사 실패:', es: 'Error al copiar:' } },
  { prefix: 'ลบ Flags ไม่สำเร็จ:', trans: { en: 'Failed to delete flags:', ja: 'Flagsの削除に失敗:', zh: '删除 Flags 失败:', ko: 'Flags 삭제 실패:', es: 'Error al eliminar flags:' } },
  { prefix: 'ลบไม่สำเร็จ:', trans: { en: 'Failed to delete:', ja: '削除に失敗:', zh: '删除失败:', ko: '삭제 실패:', es: 'Error al eliminar:' } },
  { prefix: 'บันทึก Flag ไม่สำเร็จ:', trans: { en: 'Failed to save flag:', ja: 'Flagの保存に失敗:', zh: '保存 Flag 失败:', ko: 'Flag 저장 실패:', es: 'Error al guardar flag:' } },
  { prefix: 'ลบ Flag ไม่สำเร็จ:', trans: { en: 'Failed to delete flag:', ja: 'Flagの削除に失敗:', zh: '删除 Flag 失败:', ko: 'Flag 삭제 실패:', es: 'Error al eliminar flag:' } },
  { prefix: 'เพิ่ม Flag ล้มเหลว:', trans: { en: 'Failed to add flag:', ja: 'Flagの追加に失敗:', zh: '添加 Flag 失败:', ko: 'Flag 추가 실패:', es: 'Error al agregar flag:' } },
  { prefix: 'ตั้งค่า Discord RPC ล้มเหลว:', trans: { en: 'Failed to set Discord RPC:', ja: 'Discord RPCの設定に失敗:', zh: '设置 Discord RPC 失败:', ko: 'Discord RPC 설정 실패:', es: 'Error al configurar Discord RPC:' } },
  { prefix: 'เลือกไฟล์ไม่สำเร็จ:', trans: { en: 'Failed to select file:', ja: 'ファイルの選択に失敗:', zh: '选择文件失败:', ko: '파일 선택 실패:', es: 'Error al seleccionar archivo:' } },
  { prefix: 'เลือกไฟล์เสียงตาย:', trans: { en: 'Select death sound file:', ja: '死亡音ファイルを選択:', zh: '选择死亡音效文件:', ko: '사망 효과음 파일 선택:', es: 'Seleccionar archivo de sonido de muerte:' } },
  { prefix: 'เลือกไฟล์เคอร์เซอร์:', trans: { en: 'Select cursor file:', ja: 'カーソルファイルを選択:', zh: '选择光标文件:', ko: '커서 파일 선택:', es: 'Seleccionar archivo de cursor:' } },
  { prefix: 'ติดตั้ง Mods ไม่สำเร็จ:', trans: { en: 'Failed to install mods:', ja: 'Modのインストールに失敗:', zh: '安装 Mod 失败:', ko: '모드 설치 실패:', es: 'Error al instalar mods:' } },
  { prefix: 'ติดตั้ง Mods ล้มเหลว:', trans: { en: 'Failed to install mods:', ja: 'Modのインストールに失敗:', zh: '安装 Mod 失败:', ko: '모드 설치 실패:', es: 'Error al instalar mods:' } },
  { prefix: 'ไม่สามารถเปิดโฟลเดอร์ได้:', trans: { en: 'Cannot open folder:', ja: 'フォルダを開けません:', zh: '无法打开文件夹:', ko: '폴더를 열 수 없습니다:', es: 'No se puede abrir la carpeta:' } },
  { prefix: 'บันทึกการตั้งค่าไม่สำเร็จ:', trans: { en: 'Failed to save settings:', ja: '設定の保存に失敗:', zh: '保存设置失败:', ko: '설정 저장 실패:', es: 'Error al guardar configuración:' } },
  { prefix: 'เกิดข้อผิดพลาดในการทดสอบ:', trans: { en: 'Error during test:', ja: 'テスト中にエラーが発生:', zh: '测试时发生错误:', ko: '테스트 중 오류 발생:', es: 'Error durante la prueba:' } },
  { prefix: 'บันทึกไม่สำเร็จ:', trans: { en: 'Failed to save:', ja: '保存に失敗:', zh: '保存失败:', ko: '저장 실패:', es: 'Error al guardar:' } },
  { prefix: 'เพิ่มไม่สำเร็จ:', trans: { en: 'Failed to add:', ja: '追加に失敗:', zh: '添加失败:', ko: '추가 실패:', es: 'Error al agregar:' } },
  { prefix: 'ไม่สำเร็จ:', trans: { en: 'Failed:', ja: '失敗:', zh: '失败:', ko: '실패:', es: 'Error:' } }
];

// Bidirectional Reverse Lookup: Map all translated strings back to Thai key
const _i18nReverse = {};
for (const [thaiKey, translations] of Object.entries(TEXT_MAP)) {
  _i18nReverse[thaiKey] = thaiKey;
  _i18nReverse[thaiKey.trim()] = thaiKey;
  _i18nReverse[thaiKey.replace(/\s+/g, ' ').trim()] = thaiKey;

  for (const [lang, trans] of Object.entries(translations)) {
    if (typeof trans === 'string' && trans) {
      _i18nReverse[trans] = thaiKey;
      _i18nReverse[trans.trim()] = thaiKey;
      _i18nReverse[trans.replace(/\s+/g, ' ').trim()] = thaiKey;
    }
  }
}

/**
 * Match dynamic parameter rules or prefix rules
 */
function translateDynamic(text, lang) {
  if (!text || typeof text !== 'string') return text;
  lang = lang || _currentLanguage || 'th';
  if (lang === 'th') return text;

  const clean = text.trim();

  for (const rule of DYNAMIC_RULES) {
    const m = clean.match(rule.regex);
    if (m) {
      let res = rule.trans[lang] || rule.trans.en;
      for (let i = 1; i < m.length; i++) {
        res = res.replace(new RegExp('\\{' + (i - 1) + '\\}', 'g'), (m[i] || '').trim());
      }
      return res;
    }
  }

  for (const p of PREFIX_RULES) {
    if (clean.startsWith(p.prefix)) {
      const rest = clean.slice(p.prefix.length).trim();
      const pTrans = p.trans[lang] || p.trans.en;
      return pTrans + ' ' + rest;
    }
  }

  return text;
}

/**
 * Translate a key into the active language with optional parameter interpolation.
 * Supports {0}, {1}, etc.
 */
function t(key, ...args) {
  if (typeof key !== 'string' || !key) return key || '';
  const lang = (typeof window !== 'undefined' && window.selectedLanguage) || _currentLanguage || 'th';

  const rawKey = key;
  const trimmedKey = rawKey.trim();
  const normalizedKey = trimmedKey.replace(/\s+/g, ' ');

  // Direct lookup or reverse lookup
  let thaiKey = TEXT_MAP[rawKey] ? rawKey : (TEXT_MAP[trimmedKey] ? trimmedKey : (TEXT_MAP[normalizedKey] ? normalizedKey : null));
  if (!thaiKey) {
    thaiKey = _i18nReverse[rawKey] || _i18nReverse[trimmedKey] || _i18nReverse[normalizedKey];
  }

  let translation = null;
  if (thaiKey && TEXT_MAP[thaiKey]) {
    if (lang === 'th') {
      translation = thaiKey;
    } else {
      translation = TEXT_MAP[thaiKey][lang] || TEXT_MAP[thaiKey]['en'] || thaiKey;
    }
  } else if (lang !== 'th') {
    // Dynamic rule or prefix rule fallback
    const dynamicRes = translateDynamic(rawKey, lang);
    if (dynamicRes !== rawKey) {
      translation = dynamicRes;
    } else {
      translation = rawKey;
    }
  } else {
    translation = rawKey;
  }

  // Preserve leading and trailing whitespace if input was trimmed
  if (translation && trimmedKey !== rawKey && !translation.startsWith(' ')) {
    const leadingWs = rawKey.match(/^\s*/)[0];
    const trailingWs = rawKey.match(/\s*$/)[0];
    translation = leadingWs + translation + trailingWs;
  }

  // Interpolate arguments {0}, {1}, etc.
  if (args && args.length > 0 && typeof translation === 'string') {
    args.forEach((arg, idx) => {
      translation = translation.replace(new RegExp('\\{' + idx + '\\}', 'g'), String(arg));
    });
  }

  return translation;
}

/**
 * Format relative time across all supported languages.
 */
function formatTimeAgo(dateInput, lang) {
  lang = lang || (typeof window !== 'undefined' && window.selectedLanguage) || _currentLanguage || 'th';
  const now = Date.now();
  const time = new Date(dateInput).getTime();
  if (!time || isNaN(time)) return '';

  const diffSec = Math.floor((now - time) / 1000);
  if (diffSec < 60) {
    const justNowMap = {
      th: 'เมื่อสักครู่',
      en: 'just now',
      ja: 'たった今',
      zh: '刚刚',
      ko: '방금',
      es: 'hace un momento'
    };
    return justNowMap[lang] || justNowMap.en;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    const minMap = {
      th: diffMin + ' นาทีที่แล้ว',
      en: diffMin + (diffMin === 1 ? ' minute ago' : ' minutes ago'),
      ja: diffMin + ' 分前',
      zh: diffMin + ' 分钟前',
      ko: diffMin + '분 전',
      es: 'hace ' + diffMin + (diffMin === 1 ? ' minuto' : ' minutos')
    };
    return minMap[lang] || minMap.en;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    const hourMap = {
      th: diffHours + ' ชั่วโมงที่แล้ว',
      en: diffHours + (diffHours === 1 ? ' hour ago' : ' hours ago'),
      ja: diffHours + ' 時間前',
      zh: diffHours + ' 小时前',
      ko: diffHours + '시간 전',
      es: 'hace ' + diffHours + (diffHours === 1 ? ' hora' : ' horas')
    };
    return hourMap[lang] || hourMap.en;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    const dayMap = {
      th: diffDays + ' วันที่แล้ว',
      en: diffDays + (diffDays === 1 ? ' day ago' : ' days ago'),
      ja: diffDays + ' 日前',
      zh: diffDays + ' 天前',
      ko: diffDays + '일 전',
      es: 'hace ' + diffDays + (diffDays === 1 ? ' día' : ' días')
    };
    return dayMap[lang] || dayMap.en;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    const monthMap = {
      th: diffMonths + ' เดือนที่แล้ว',
      en: diffMonths + (diffMonths === 1 ? ' month ago' : ' months ago'),
      ja: diffMonths + ' ヶ月前',
      zh: diffMonths + ' 个月前',
      ko: diffMonths + '달 전',
      es: 'hace ' + diffMonths + (diffMonths === 1 ? ' mes' : ' meses')
    };
    return monthMap[lang] || monthMap.en;
  }

  const diffYears = Math.floor(diffDays / 365);
  const yearMap = {
    th: diffYears + ' ปีที่แล้ว',
    en: diffYears + (diffYears === 1 ? ' year ago' : ' years ago'),
    ja: diffYears + ' 年前',
    zh: diffYears + ' 年前',
    ko: diffYears + '년 전',
    es: 'hace ' + diffYears + (diffYears === 1 ? ' año' : ' años')
  };
  return yearMap[lang] || yearMap.en;
}

/**
 * Traverse DOM and translate text nodes, attributes, placeholders, titles, aria-labels, and options.
 */
function translateDOM(root) {
  if (typeof document === 'undefined') return;
  const lang = (typeof window !== 'undefined' && window.selectedLanguage) || _currentLanguage || 'th';
  root = root || document.body;
  if (!root) return;

  const walk = (node) => {
    if (node.nodeType === 3) { // Text node
      const rawText = node.textContent;
      const text = rawText.trim();
      if (!text) return;
      const normalizedText = text.replace(/\s+/g, ' ');

      let thaiKey = _i18nReverse[text] || _i18nReverse[normalizedText];
      if (thaiKey && TEXT_MAP[thaiKey]) {
        const trans = (lang === 'th') ? thaiKey : (TEXT_MAP[thaiKey][lang] || TEXT_MAP[thaiKey]['en'] || thaiKey);
        if (trans && trans !== text) {
          const leadingWs = rawText.match(/^\s*/)[0];
          const trailingWs = rawText.match(/\s*$/)[0];
          node.textContent = leadingWs + trans + trailingWs;
        }
      } else if (lang !== 'th' && /[\u0E00-\u0E7F]/.test(text)) {
        // Dynamic fallback translation
        const trans = translateDynamic(text, lang);
        if (trans && trans !== text) {
          const leadingWs = rawText.match(/^\s*/)[0];
          const trailingWs = rawText.match(/\s*$/)[0];
          node.textContent = leadingWs + trans + trailingWs;
        }
      }
    } else if (node.nodeType === 1) { // Element node
      const tag = node.tagName;
      if (tag !== 'SCRIPT' && tag !== 'STYLE' && tag !== 'CODE') {
        if (node.placeholder) {
          const ph = node.placeholder.trim();
          const phKey = _i18nReverse[ph] || _i18nReverse[ph.replace(/\s+/g, ' ')];
          if (phKey && TEXT_MAP[phKey]) {
            const trans = (lang === 'th') ? phKey : (TEXT_MAP[phKey][lang] || TEXT_MAP[phKey]['en'] || phKey);
            if (trans) node.placeholder = trans;
          } else if (lang !== 'th' && /[\u0E00-\u0E7F]/.test(ph)) {
            node.placeholder = translateDynamic(ph, lang);
          }
        }
        if (node.title) {
          const tl = node.title.trim();
          const tlKey = _i18nReverse[tl] || _i18nReverse[tl.replace(/\s+/g, ' ')];
          if (tlKey && TEXT_MAP[tlKey]) {
            const trans = (lang === 'th') ? tlKey : (TEXT_MAP[tlKey][lang] || TEXT_MAP[tlKey]['en'] || tlKey);
            if (trans) node.title = trans;
          } else if (lang !== 'th' && /[\u0E00-\u0E7F]/.test(tl)) {
            node.title = translateDynamic(tl, lang);
          }
        }
        if (node.getAttribute && node.getAttribute('aria-label')) {
          const al = node.getAttribute('aria-label').trim();
          const alKey = _i18nReverse[al] || _i18nReverse[al.replace(/\s+/g, ' ')];
          if (alKey && TEXT_MAP[alKey]) {
            const trans = (lang === 'th') ? alKey : (TEXT_MAP[alKey][lang] || TEXT_MAP[alKey]['en'] || alKey);
            if (trans) node.setAttribute('aria-label', trans);
          } else if (lang !== 'th' && /[\u0E00-\u0E7F]/.test(al)) {
            node.setAttribute('aria-label', translateDynamic(al, lang));
          }
        }
        if (tag === 'OPTION') {
          const optText = node.textContent.trim();
          const optKey = _i18nReverse[optText] || _i18nReverse[optText.replace(/\s+/g, ' ')];
          if (optKey && TEXT_MAP[optKey]) {
            const trans = (lang === 'th') ? optKey : (TEXT_MAP[optKey][lang] || TEXT_MAP[optKey]['en'] || optKey);
            if (trans && trans !== optText) node.textContent = trans;
          } else if (lang !== 'th' && /[\u0E00-\u0E7F]/.test(optText)) {
            node.textContent = translateDynamic(optText, lang);
          }
        }
        for (const child of node.childNodes) {
          walk(child);
        }
      }
    }
  };

  walk(root);
}

function setLanguage(lang) {
  if (LANG_OPTIONS[lang]) {
    _currentLanguage = lang;
    if (typeof window !== 'undefined') {
      window.selectedLanguage = lang;
    }
  }
}

function getLanguage() {
  return (typeof window !== 'undefined' && window.selectedLanguage) || _currentLanguage || 'th';
}

// Global Browser Exports
if (typeof window !== 'undefined') {
  window.i18n = {
    LANG_OPTIONS,
    TEXT_MAP,
    _i18nReverse,
    DYNAMIC_RULES,
    PREFIX_RULES,
    translateDynamic,
    t,
    formatTimeAgo,
    translateDOM,
    setLanguage,
    getLanguage
  };
  window.t = t;
  window.translateDOM = translateDOM;
  window.formatTimeAgo = formatTimeAgo;
  window.TEXT_MAP = TEXT_MAP;
  window.LANG_OPTIONS = LANG_OPTIONS;
  window._i18nReverse = _i18nReverse;
  window.setLanguage = setLanguage;
  window.getLanguage = getLanguage;
}

// Node.js Module Exports (for testing and automation)
if (typeof module !== 'undefined') {
  module.exports = {
    LANG_OPTIONS,
    TEXT_MAP,
    _i18nReverse,
    DYNAMIC_RULES,
    PREFIX_RULES,
    translateDynamic,
    t,
    formatTimeAgo,
    translateDOM,
    setLanguage,
    getLanguage
  };
}

})();

