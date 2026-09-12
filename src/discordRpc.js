// ── Discord Rich Presence (RPC) Client ─────────────────────────────────────
// Pure Node.js implementation connecting to Discord local IPC pipe without external dependencies.

const net = require('net');
const EventEmitter = require('events');

const OP_HANDSHAKE = 0;
const OP_FRAME = 1;
const OP_CLOSE = 2;
const OP_PING = 3;
const OP_PONG = 4;

const DEFAULT_CLIENT_ID = '1005469189907173486';

function getIpcPath(id = 0) {
  if (process.platform === 'win32') {
    return `\\\\?\\pipe\\discord-ipc-${id}`;
  }
  const prefix = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || '/tmp';
  return `${prefix}/discord-ipc-${id}`;
}

function formatPresenceText(template, context = {}, hideUsernames = false, hideGameDetails = false) {
  if (!template || typeof template !== 'string') return '';
  
  const online = context.onlineCount !== undefined ? context.onlineCount : 0;
  const total = context.totalCount !== undefined ? context.totalCount : 0;
  
  let game = context.gameName || 'Roblox';
  if (hideGameDetails) game = 'Roblox';
  
  let user = context.username || 'Player';
  if (hideUsernames) user = 'Player';
  
  const afk = context.antiAfkActive ? 'Active' : 'Inactive';
  const fps = context.fpsCap || 'Uncapped';

  return template
    .replace(/{online}/g, String(online))
    .replace(/{total}/g, String(total))
    .replace(/{game}/g, String(game))
    .replace(/{user}/g, String(user))
    .replace(/{afk}/g, String(afk))
    .replace(/{fps}/g, String(fps));
}

class DiscordRpcClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.clientId = options.clientId || DEFAULT_CLIENT_ID;
    this.socket = null;
    this.connected = false;
    this.ready = false;
    this.user = null;
    this.currentActivity = null;
    this._reconnectTimer = null;
    this._buffer = Buffer.alloc(0);
    this._pipeIndex = 0;
  }

  encodePacket(opcode, payload) {
    const jsonStr = JSON.stringify(payload);
    const payloadLen = Buffer.byteLength(jsonStr, 'utf8');
    const packet = Buffer.alloc(8 + payloadLen);
    packet.writeInt32LE(opcode, 0);
    packet.writeInt32LE(payloadLen, 4);
    packet.write(jsonStr, 8, payloadLen, 'utf8');
    return packet;
  }

  connect() {
    if (this.socket) return;
    this._tryNextPipe(0);
  }

  _tryNextPipe(index = 0) {
    if (index > 9) {
      this.connected = false;
      this.ready = false;
      this.emit('disconnected');
      this._scheduleReconnect();
      return;
    }

    const pipePath = getIpcPath(index);
    const sock = net.createConnection({ path: pipePath });

    let connTimeout = setTimeout(() => {
      try { sock.destroy(); } catch {}
      this._tryNextPipe(index + 1);
    }, 1200);

    sock.once('connect', () => {
      clearTimeout(connTimeout);
      this.socket = sock;
      this.connected = true;
      this.ready = false;
      this._pipeIndex = index;
      this._buffer = Buffer.alloc(0);

      // Send Handshake
      const handshake = this.encodePacket(OP_HANDSHAKE, {
        v: 1,
        client_id: this.clientId
      });
      sock.write(handshake);

      sock.on('data', data => this._handleData(data));
      sock.on('error', () => this._handleClose());
      sock.on('close', () => this._handleClose());

      this.emit('connected', { pipe: pipePath });
    });

    sock.once('error', () => {
      clearTimeout(connTimeout);
      try { sock.destroy(); } catch {}
      this._tryNextPipe(index + 1);
    });
  }

  _handleData(data) {
    this._buffer = Buffer.concat([this._buffer, data]);

    while (this._buffer.length >= 8) {
      const opcode = this._buffer.readInt32LE(0);
      const length = this._buffer.readInt32LE(4);

      if (this._buffer.length < 8 + length) {
        break; // Wait for full packet
      }

      const payloadBuf = this._buffer.slice(8, 8 + length);
      this._buffer = this._buffer.slice(8 + length);

      try {
        const payload = JSON.parse(payloadBuf.toString('utf8'));
        if (opcode === OP_FRAME) {
          if (payload.cmd === 'DISPATCH' && payload.evt === 'READY') {
            this.ready = true;
            this.user = payload.data ? payload.data.user : null;
            this.emit('ready', payload.data);
            if (this.currentActivity) {
              this._sendActivity(this.currentActivity);
            }
          } else if (payload.evt === 'ERROR') {
            this.emit('error', payload.data);
          }
        } else if (opcode === OP_PING) {
          this.socket.write(this.encodePacket(OP_PONG, payload));
        } else if (opcode === OP_CLOSE) {
          this._handleClose();
        }
      } catch {}
    }
  }

  _handleClose() {
    if (this.socket) {
      try { this.socket.destroy(); } catch {}
      this.socket = null;
    }
    const wasConnected = this.connected;
    this.connected = false;
    this.ready = false;
    if (wasConnected) {
      this.emit('disconnected');
    }
    this._scheduleReconnect();
  }

  _scheduleReconnect() {
    clearTimeout(this._reconnectTimer);
    this._reconnectTimer = setTimeout(() => {
      if (!this.connected) {
        this.connect();
      }
    }, 12000);
  }

  setActivity(activity) {
    this.currentActivity = activity;
    if (!this.socket || !this.connected || !this.ready) {
      return false;
    }
    return this._sendActivity(activity);
  }

  _sendActivity(activity) {
    if (!this.socket || !this.connected) return false;

    const frame = this.encodePacket(OP_FRAME, {
      cmd: 'SET_ACTIVITY',
      args: {
        pid: process.pid,
        activity: activity || null
      },
      nonce: String(Date.now())
    });

    try {
      this.socket.write(frame);
      return true;
    } catch {
      return false;
    }
  }

  clearActivity() {
    return this.setActivity(null);
  }

  disconnect() {
    clearTimeout(this._reconnectTimer);
    this.currentActivity = null;
    this.connected = false;
    this.ready = false;
    if (this.socket) {
      try { this.socket.destroy(); } catch {}
      this.socket = null;
    }
    this.emit('disconnected');
  }
}

module.exports = {
  DiscordRpcClient,
  formatPresenceText,
  DEFAULT_CLIENT_ID
};
