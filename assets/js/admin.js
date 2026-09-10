(function () {
  var SCOPES = ['site', 'cozy-nest', 'cozy-roots', 'cozy-arts'];
  var cache = {}; // scope -> current data object

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, obj);
  }
  function set(obj, path, value) {
    var keys = path.split('.');
    var cur = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      if (typeof cur[keys[i]] !== 'object' || cur[keys[i]] === null) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }

  function api(url, opts) {
    return fetch(url, Object.assign({ credentials: 'same-origin' }, opts))
      .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body }; }); });
  }

  function showApp() {
    document.getElementById('login-view').hidden = true;
    document.getElementById('app-view').hidden = false;
    loadAllScopes();
  }

  function showLogin() {
    document.getElementById('login-view').hidden = false;
    document.getElementById('app-view').hidden = true;
  }

  function loadAllScopes() {
    SCOPES.forEach(function (scope) {
      api('/api/content?scope=' + scope).then(function (res) {
        if (!res.ok) return;
        cache[scope] = res.body.data || {};
        fillForm(scope, cache[scope]);
        if (scope === 'site') {
          var badge = document.getElementById('db-badge');
          if (res.body.hasDatabase) {
            badge.textContent = 'Database connected';
            badge.className = 'db-badge on';
          } else {
            badge.textContent = 'No database yet — see README';
            badge.className = 'db-badge off';
          }
        }
      });
    });
  }

  function fillForm(scope, data) {
    var panel = document.querySelector('.panel[data-panel="' + scope + '"]');
    if (!panel) return;
    panel.querySelectorAll('[data-path]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-path'));
      el.value = v === undefined || v === null ? '' : v;
    });
  }

  function readForm(scope) {
    var panel = document.querySelector('.panel[data-panel="' + scope + '"]');
    var data = JSON.parse(JSON.stringify(cache[scope] || {}));
    panel.querySelectorAll('[data-path]').forEach(function (el) {
      set(data, el.getAttribute('data-path'), el.value);
    });
    return data;
  }

  function wireTabs() {
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelector('.panel[data-panel="' + btn.getAttribute('data-scope') + '"]').classList.add('active');
      });
    });
  }

  function wireSave() {
    document.querySelectorAll('.save-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var scope = btn.getAttribute('data-scope');
        var statusEl = document.querySelector('[data-status="' + scope + '"]');
        var data = readForm(scope);
        btn.disabled = true;
        statusEl.textContent = 'Saving…';
        statusEl.className = 'status-msg';
        api('/api/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope: scope, data: data })
        }).then(function (res) {
          btn.disabled = false;
          if (res.ok) {
            cache[scope] = data;
            statusEl.textContent = 'Saved ✓';
            statusEl.className = 'status-msg ok';
          } else {
            statusEl.textContent = res.body.error || 'Save failed';
            statusEl.className = 'status-msg err';
          }
        });
      });
    });
  }

  function wireLogin() {
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var password = document.getElementById('password').value;
      var errEl = document.getElementById('login-error');
      errEl.textContent = '';
      api('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
      }).then(function (res) {
        if (res.ok) {
          showApp();
        } else {
          errEl.textContent = res.body.error || 'Login failed';
        }
      });
    });
  }

  function wireLogout() {
    document.getElementById('logout-btn').addEventListener('click', function () {
      api('/api/logout', { method: 'POST' }).then(function () { showLogin(); });
    });
  }

  function init() {
    wireTabs();
    wireSave();
    wireLogin();
    wireLogout();
    api('/api/session').then(function (res) {
      if (res.ok && res.body.authenticated) showApp();
      else showLogin();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
