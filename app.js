
var GOOGLE_SCRIPT_URL = 'https:
var CATEGORIAS = {
  infantil_a:        {nombre:'Infantil A',       formato:'F11', duracion:35, icono:'⚽', jugadores:[]},
  infantil_b:        {nombre:'Infantil B',       formato:'F11', duracion:35, icono:'⚽', jugadores:[]},
  infantil_femenino: {nombre:'Infantil Femenino',formato:'F11', duracion:35, icono:'⚽', jugadores:[]},
  cadete_a:          {nombre:'Cadete A',         formato:'F11', duracion:40, icono:'⚽', jugadores:[]},
  cadete_b:          {nombre:'Cadete B',         formato:'F11', duracion:40, icono:'⚽', jugadores:[]},
  cadete_femenino:   {nombre:'Cadete Femenino',  formato:'F11', duracion:40, icono:'⚽', jugadores:[]},
  juvenil_a:         {nombre:'Juvenil A',        formato:'F11', duracion:45, icono:'⚽', jugadores:[]},
  juvenil_b:         {nombre:'Juvenil B',        formato:'F11', duracion:45, icono:'⚽', jugadores:[]},
  amateur:           {nombre:'Amateur',          formato:'F11', duracion:45, icono:'⚽', jugadores:[
    'Medina Teruel, Simon','Quesada Vicente, Iker','Cerrada Jaime, Radames',
    'Bojeje Salas, Cristian','Rodriguez Maturana, Thiago','Moreno Moreno, Ruben',
    'Espinal Fernandez, Pablo','Mengod Perez, Javier','Mora de Lario, Jose A.',
    'Vasquez Lara, Juan F.','Paton Gonzalez, Jorge','Leon Vela, Pablo',
    'Chaparro Gimenez, Carlos','Abouabassi, Tawfiq','Burgos Carbonell, Pablo','Jimenez, Eric'
  ]},
  veteranos:         {nombre:'Veteranos',        formato:'F11', duracion:45, icono:'⚽', jugadores:[]},
  querubin:          {nombre:'Querubin',         formato:'F8',  duracion:20, icono:'🌟', jugadores:[]},
  prebenjamin_a:     {nombre:'Prebenjamin A',    formato:'F8',  duracion:25, icono:'🌟', jugadores:[]},
  prebenjamin_b:     {nombre:'Prebenjamin B',    formato:'F8',  duracion:25, icono:'🌟', jugadores:[]},
  benjamin_a:        {nombre:'Benjamin A',       formato:'F8',  duracion:25, icono:'🌟', jugadores:[]},
  benjamin_b:        {nombre:'Benjamin B',       formato:'F8',  duracion:25, icono:'🌟', jugadores:[
    'Alaux, Nael','Arambul Navarro, Oliver','Garcia Piera, Carles',
    'Lopez Gimenez, Adrian','Martinez Jimenez, Rodrigo','Martinez Lopez, Alejandro',
    'Morales Navarro, Matteo','Salvador Jarque, Daniel','Soriano Morte, Marc',
    'Torrella Castillo, Mario','Vina Lopez, Arturo','Martinez Ruano, Miguel Angel','Fuertes Tarraga, Pedro'
  ]},
  alevin_a:          {nombre:'Alevin A',         formato:'F8',  duracion:30, icono:'🌟', jugadores:[]},
  alevin_b:          {nombre:'Alevin B',         formato:'F8',  duracion:30, icono:'🌟', jugadores:[]},
  alevin_c:          {nombre:'Alevin C',         formato:'F8',  duracion:30, icono:'🌟', jugadores:[]},
  alevin_femenino:   {nombre:'Alevin Femenino',  formato:'F8',  duracion:30, icono:'🌟', jugadores:[]}
};
var F11_CATS = ['infantil_a','infantil_b','infantil_femenino','cadete_a','cadete_b','cadete_femenino','juvenil_a','juvenil_b','amateur','veteranos'];
var F8_CATS  = ['prebenjamin_a','prebenjamin_b','benjamin_a','benjamin_b','alevin_a','alevin_b','alevin_femenino'];
var TACTICOS = ['Desmarque en apoyo','Desmarque en ruptura','Ataque','Contraataque','Espacios libres','Apoyos','Paredes','Conservacion del balon','Cambios de ritmo','Cambios de orientacion','Progresion','Repliegue','Coberturas','Permutas','Pressing','Anticipacion','Interceptacion','Marcaje zonal','Marcaje individual'];
var FISICOS  = ['Coordinacion','Equilibrio','Velocidad de reaccion','Agilidad','Velocidad','Resistencia (juego)','Fuerza natural (duelos)','Fuerza explosiva','Resistencia aerobica','Resistencia anaerobica','Potencia','Flexibilidad'];
var TECNICOS = ['Control','Pase','Tiro','Interceptacion','Regate','Remate','Temporizacion','Paredes','Entrada','Conduccion'];
var STATS_DEF = [
  ['Ocasiones de gol','ocasiones'],['Tiros a puerta','tiros_puerta'],['Tiros fuera','tiros_fuera'],
  ['Tiros bloqueados','tiros_bloqueados'],['Corners','corners'],['Faltas recibidas','faltas_fav'],
  ['Faltas cometidas','faltas_cnt'],['Tarjetas amarillas','amarillas'],['Tarjetas rojas','rojas'],
  ['Paradas del portero','paradas'],['Fuera de juego a favor','fdj_fav'],['Fuera de juego en contra','fdj_cnt'],
  ['BP a favor','bp_fav'],['BP en contra','bp_cnt'],['Penaltis a favor','pen_fav'],['Penaltis en contra','pen_cnt'],
  ['Duelos ganados','duelos'],['Centros al area','centros'],['Contragolpes','contragolpes']
];
var MOTIVOS = ['Sin comunicar','Lesion','Enfermedad','Estudios / Examenes','Trabajo','Sancion','Motivos personales','Viaje','Otro'];
var COLORES  = ['#1A3A6B','#1E7B34','#C0392B','#E8771A','#534AB7','#0F6E56','#712B13','#185FA5'];
var cfg = {};
var equipoActual = '';
var playerStatus = {};
var cntValues = {};
var goalCount = 0;
var lastAction = '';
var selectedPills = {tac:[],fis:[],tec:[]};
async function hacerLogin() {
  var usuario    = document.getElementById('l-usuario').value.trim().toLowerCase();
  var contrasena = document.getElementById('l-contrasena').value.trim();
  var errorEl    = document.getElementById('login-error');
  if (!usuario || !contrasena) { errorEl.textContent='Introduce usuario y contrasena'; errorEl.style.display='block'; return; }
  errorEl.style.display = 'none';
  document.getElementById('overlay-txt').textContent = 'Verificando acceso...';
  document.getElementById('overlay').classList.add('show');
  try {
    var resp = await fetch(GOOGLE_SCRIPT_URL + '?usuario=' + encodeURIComponent(usuario) + '&contrasena=' + encodeURIComponent(contrasena));
    var data = await resp.json();
    document.getElementById('overlay').classList.remove('show');
    if (data.ok) {
      cfg = {nombre:data.nombre, equipo:data.equipo||'', rol:data.rol, usuario:usuario};
      localStorage.setItem('silos_sesion', JSON.stringify(cfg));
      iniciarApp();
    } else {
      errorEl.textContent = 'Usuario o contrasena incorrectos';
      errorEl.style.display = 'block';
    }
  } catch(e) {
    document.getElementById('overlay').classList.remove('show');
    errorEl.textContent = 'Error de conexion. Comprueba internet.';
    errorEl.style.display = 'block';
  }
}
function cerrarSesion() {
  localStorage.removeItem('silos_sesion');
  cfg = {}; equipoActual = '';
  document.getElementById('l-usuario').value = '';
  document.getElementById('l-contrasena').value = '';
  irA('s-login');
}
function irA(id) {
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  if (id === 's-scouting') {
    var campoEq = document.getElementById('campo-equipo-scout');
    var esSup = cfg.rol==='superadmin'||cfg.rol==='director'||cfg.rol==='presidente';
    if (campoEq) campoEq.style.display = esSup ? 'block' : 'none';
    var selEq = document.getElementById('scout-equipo');
    var catActual = esSup ? (selEq ? selEq.value : equipoActual) : equipoActual;
    cargarJornadaProxima(catActual);
  }
}
function iniciarApp() {
  if (cfg.rol === 'director') {
    buildSelectorEquipos();
    irA('s-selector');
  } else {
    equipoActual = cfg.equipo;
    cargarMenuEquipo();
    irA('s-inicio');
  }
}
function buildSelectorEquipos() {
  document.getElementById('selector-saludo').textContent = 'Hola, ' + cfg.nombre.split(' ')[0];
  var gF11 = document.getElementById('grid-f11');
  var gF8  = document.getElementById('grid-f8');
  gF11.innerHTML = F11_CATS.map(function(k) { return tarjetaEquipo(k); }).join('');
  gF8.innerHTML  = F8_CATS.map(function(k)  { return tarjetaEquipo(k); }).join('');
}
function tarjetaEquipo(key) {
  var cat = CATEGORIAS[key];
  return '<div class="equipo-card ' + (cat.formato==='F11'?'f11':'f8') + '" onclick="seleccionarEquipo(\'' + key + '\')">' +
    '<div class="equipo-card-icon">' + cat.icono + '</div>' +
    '<div class="equipo-card-nombre">' + cat.nombre + '</div>' +
    '<div class="equipo-card-formato">' + cat.formato + '</div>' +
  '</div>';
}
function seleccionarEquipo(key) {
  equipoActual = key;
  cargarMenuEquipo();
  irA('s-inicio');
}
function cargarMenuEquipo() {
  var esDirector   = cfg.rol === 'director' || cfg.rol === 'presidente' || cfg.rol === 'superadmin';
  var esEntrenador = cfg.rol === 'entrenador';
  var esSuperAdmin = cfg.rol === 'superadmin';
  var esPagos      = cfg.rol === 'superadmin' || cfg.rol === 'presidente';
  var cat = CATEGORIAS[equipoActual] || {nombre: equipoActual, formato:'F11', duracion:45, jugadores:[]};
  var esF11 = F11_CATS.indexOf(equipoActual) !== -1;
  document.getElementById('top-cat-badge').textContent     = cat.nombre + ' · ' + cat.formato;
  document.getElementById('saludo-txt').textContent        = esDirector
    ? 'Director Deportivo · Viendo: ' + cat.nombre
    : 'Hola, ' + cfg.nombre.split(' ')[0] + ' · ' + cat.nombre;
  document.getElementById('entreno-cat-label').textContent  = cat.nombre;
  document.getElementById('partido-cat-label').textContent  = cat.nombre;
  document.getElementById('se-cat-label').textContent       = cat.nombre;
  document.getElementById('sp-cat-label').textContent       = cat.nombre;
  document.getElementById('btn-cambiar').style.display = esDirector ? 'block' : 'none';
  document.getElementById('menu-f11').style.display      = (esF11 || esDirector) ? 'block' : 'none';
  document.getElementById('menu-director').style.display = esDirector ? 'block' : 'none';
  cargarUltimos();
  cargarPlantillaRemota();
  if (esF11 || esDirector) cargarProximosPartidos();
  var bU  = document.getElementById('btn-usuarios');
  var bP  = document.getElementById('btn-pagos');
  var bMU = document.getElementById('btn-mensajes-urgentes');
  if (bU)  bU.style.display  = esSuperAdmin ? '' : 'none';
  if (bP)  bP.style.display  = esPagos ? '' : 'none';
  if (bMU) bMU.style.display = (esSuperAdmin || esPresidente || esDirector) ? '' : 'none';
  var bD = document.getElementById('btn-directo');
  if (bD) bD.style.display = (cfg.permisos && cfg.permisos.directo) || esSuperAdmin || esPresidente || esDirector || esEntrenador ? '' : 'none';
}
async function cargarPlantillaRemota() {
  if (!equipoActual) return;
  try {
    var r = await fetch(GOOGLE_SCRIPT_URL + '?action=plantilla&categoria=' + encodeURIComponent(equipoActual)).then(function(r){return r.json();});
    if (r.ok && r.jugadores && r.jugadores.length) {
      if (!CATEGORIAS[equipoActual]) CATEGORIAS[equipoActual] = {nombre:equipoActual, formato:'F11', duracion:45, jugadores:[]};
      CATEGORIAS[equipoActual].jugadores = r.jugadores;
      localStorage.setItem('silos_plantilla_' + equipoActual, JSON.stringify(r.jugadores));
    }
  } catch(e) {
    var saved = localStorage.getItem('silos_plantilla_' + equipoActual);
    if (saved && CATEGORIAS[equipoActual]) CATEGORIAS[equipoActual].jugadores = JSON.parse(saved);
  }
}
async function cargarProximosPartidos() {
  try {
    var resp = await fetch(GOOGLE_SCRIPT_URL + '?action=proximos&categoria=' + encodeURIComponent(equipoActual));
    var data = await resp.json();
    if (!data.ok || !data.proximos || !data.proximos.length) return;
    localStorage.setItem('silos_proxima_jornada', data.proximos[0].j_num);
    var cont = document.getElementById('proximos-partidos-cont');
    if (!cont) return;
    cont.innerHTML = data.proximos.map(function(p) {
      var cond = p.condicion === 'Local' ? '🏠 Local' : '✈️ Visitante';
      var fecha = formatearFecha(p.fecha);
      var hora  = formatearHora(p.hora);
      return '<div class="home-card" onclick="abrirInforme(' + p.j_num + ')" style="border-left:3px solid var(--azul2)">' +
        '<div class="home-card-icon" style="background:var(--azul-c)">📋</div>' +
        '<div><h3 style="font-size:14px">Informe ' + p.jornada + '</h3>' +
        '<p>vs ' + p.rival + ' · ' + cond + (fecha ? ' · ' + fecha : '') + (hora ? ' ' + hora : '') + '</p></div>' +
        '<span class="chevron">›</span></div>';
    }).join('');
    var sp = document.getElementById('scouting-proximos');
    if (sp) sp.innerHTML = '<p class="section-label">Proximos partidos</p>' +
      data.proximos.map(function(p) {
        var fecha = formatearFecha(p.fecha);
        return '<div class="home-card" onclick="abrirInforme(' + p.j_num + ')">' +
          '<div class="home-card-icon" style="background:var(--azul-c)">📋</div>' +
          '<div><h3 style="font-size:14px">' + p.jornada + ' vs ' + p.rival + '</h3>' +
          '<p>' + (p.condicion==='Local'?'🏠':'✈️') + ' ' + p.condicion + (fecha?' · '+fecha:'') + '</p></div>' +
          '<span class="chevron">›</span></div>';
      }).join('');
  } catch(e) { console.warn('proximos:', e); }
}
function formatearFecha(raw) {
  if (!raw) return '';
  try {
    var d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'numeric'});
  } catch(e) { return raw; }
}
function formatearHora(raw) {
  if (!raw) return '';
  try {
    var d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'});
  } catch(e) { return raw; }
}
function abrirInforme(j_num) {
  localStorage.setItem('silos_proxima_jornada', j_num);
  localStorage.setItem('silos_categoria_activa', equipoActual);
  window.location.href = 'informe_rival.html?jornada=' + j_num + '&categoria=' + encodeURIComponent(equipoActual);
}
async function cargarJornadaProxima(cat) {
  var input = document.getElementById('scout-jornada');
  if (!input) return;
  input.value = '';
  input.placeholder = 'Cargando...';
  try {
    var r = await fetch(GOOGLE_SCRIPT_URL + '?action=proximos&categoria=' + encodeURIComponent(cat)).then(function(r){return r.json();});
    if (r.ok && r.proximos && r.proximos.length) {
      input.value = r.proximos[0].j_num || '';
      input.placeholder = '26';
    } else {
      input.placeholder = 'Sin datos';
    }
  } catch(e) { input.placeholder = '26'; }
}
function abrirScout() {
  var j = document.getElementById('scout-jornada').value;
  if (!j) { alert('Introduce el numero de jornada'); return; }
  var selEq = document.getElementById('scout-equipo');
  var cat = (selEq && selEq.offsetParent !== null) ? selEq.value : equipoActual;
  localStorage.setItem('silos_proxima_jornada', parseInt(j));
  localStorage.setItem('silos_categoria_activa', cat);
  window.location.href = 'informe_rival.html?jornada=' + parseInt(j) + '&categoria=' + encodeURIComponent(cat);
}
function buildStatsEntreno() {
  var key  = 'silos_reg_' + equipoActual;
  var regs = JSON.parse(localStorage.getItem(key)||'[]').filter(function(r){ return r.tipo==='entrenamiento'; });
  var body = document.getElementById('se-body');
  if (!regs.length) { body.innerHTML='<div style="text-align:center;padding:40px;color:var(--texto3)">Sin entrenamientos registrados aun.</div>'; return; }
  var total=regs.length, tp=0, ta=0;
  regs.forEach(function(r){ tp+=parseInt(r.presentes)||0; ta+=parseInt(r.ausentes)||0; });
  var avg = tp+ta>0 ? Math.round(tp/(tp+ta)*100) : 0;
  var principios = {};
  regs.forEach(function(r){
    var ps = (r.principios_tacticos||'').split(',').concat((r.principios_fisicos||'').split(',')).concat((r.principios_tecnicos||'').split(','));
    ps.forEach(function(p){ p=p.trim(); if(p) principios[p]=(principios[p]||0)+1; });
  });
  var top_p = Object.keys(principios).sort(function(a,b){ return principios[b]-principios[a]; }).slice(0,5);
  body.innerHTML =
    '<div class="grid-3" style="margin-bottom:12px">' +
      '<div class="stat-big"><div class="stat-big-val">'+total+'</div><div class="stat-big-lbl">Entrenos</div></div>' +
      '<div class="stat-big"><div class="stat-big-val">'+avg+'%</div><div class="stat-big-lbl">Asistencia</div></div>' +
      '<div class="stat-big"><div class="stat-big-val">'+(regs[0]?regs[0].intensidad||'-':'-')+'</div><div class="stat-big-lbl">Ult. intens.</div></div>' +
    '</div>' +
    (top_p.length ? '<p class="section-label">Principios mas trabajados</p><div class="card"><div class="card-body">' +
      top_p.map(function(p){ return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid var(--borde);font-size:13px"><span>'+p+'</span><span style="font-weight:700;color:var(--azul2)">'+principios[p]+'x</span></div>'; }).join('') +
    '</div></div>' : '') +
    '<p class="section-label">Ultimos '+Math.min(total,8)+' entrenamientos</p><div class="card"><div class="card-body" style="padding:0 16px">' +
    regs.slice(0,8).map(function(r){
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid var(--borde)"><span style="font-size:13px">'+(r.fecha?r.fecha.split('-').reverse().join('/'):'-')+'</span><span style="color:var(--texto2);font-size:12px">'+(r.presentes||0)+' pres.</span><span style="font-size:12px;color:var(--texto3)">'+(r.intensidad||'')+'</span></div>';
    }).join('') + '</div></div>';
}
function buildStatsPartido() {
  var key  = 'silos_reg_' + equipoActual;
  var regs = JSON.parse(localStorage.getItem(key)||'[]').filter(function(r){ return r.tipo==='partido'; });
  var body = document.getElementById('sp-body');
  if (!regs.length) { body.innerHTML='<div style="text-align:center;padding:40px;color:var(--texto3)">Sin partidos registrados aun.</div>'; return; }
  var V=0,E=0,D=0,GF=0,GC=0;
  regs.forEach(function(r){
    var pp=(r.resultado||'').split('-');
    if(pp.length===2){
      var esL=r.condicion==='Local', s1=parseInt(pp[0])||0, s2=parseInt(pp[1])||0;
      var gf=esL?s1:s2, gc=esL?s2:s1;
      GF+=gf; GC+=gc;
      if(gf>gc)V++; else if(gf===gc)E++; else D++;
    }
  });
  var J=regs.length;
  body.innerHTML =
    '<div class="grid-3" style="margin-bottom:8px">' +
      '<div class="stat-big"><div class="stat-big-val" style="color:var(--verde)">'+V+'</div><div class="stat-big-lbl">Victorias</div></div>' +
      '<div class="stat-big"><div class="stat-big-val" style="color:#856D00">'+E+'</div><div class="stat-big-lbl">Empates</div></div>' +
      '<div class="stat-big"><div class="stat-big-val" style="color:var(--rojo)">'+D+'</div><div class="stat-big-lbl">Derrotas</div></div>' +
    '</div>' +
    '<div class="grid-3" style="margin-bottom:12px">' +
      '<div class="stat-big"><div class="stat-big-val">'+(J>0?Math.round(V/J*100):0)+'%</div><div class="stat-big-lbl">% Victorias</div></div>' +
      '<div class="stat-big"><div class="stat-big-val">'+(J>0?(GF/J).toFixed(1):'-')+'</div><div class="stat-big-lbl">GF/partido</div></div>' +
      '<div class="stat-big"><div class="stat-big-val">'+(J>0?(GC/J).toFixed(1):'-')+'</div><div class="stat-big-lbl">GC/partido</div></div>' +
    '</div>' +
    '<p class="section-label">Ultimos '+Math.min(J,8)+' resultados</p><div class="card"><div class="card-body" style="padding:0 16px">' +
    regs.slice(0,8).map(function(r){
      var res=r.resultado||'-', pp=res.split('-'), rl='-';
      if(pp.length===2){ var esL=r.condicion==='Local', gf=esL?(parseInt(pp[0])||0):(parseInt(pp[1])||0), gc=esL?(parseInt(pp[1])||0):(parseInt(pp[0])||0); rl=gf>gc?'V':gf===gc?'E':'D'; }
      return '<div class="resultado-fila"><span class="res-badge res-'+rl+'">'+rl+'</span><span>vs '+(r.rival||'-')+'</span><span style="font-weight:700">'+res+'</span><span style="font-size:11px;color:var(--texto3)">'+(r.condicion==='Local'?'🏠':'✈️')+'</span></div>';
    }).join('') + '</div></div>';
}
function buildEntrenoUI() {
function initEntreno() {
  var cat = CATEGORIAS[equipoActual] || {nombre:equipoActual, formato:'F11', duracion:45, jugadores:[]};
  var hoy = new Date();
  document.getElementById('e-fecha').value    = hoy.toISOString().split('T')[0];
  document.getElementById('e-hora').value     = hoy.toTimeString().slice(0,5);
  document.getElementById('e-duracion').value = cat.duracion * 2;
  playerStatus = {};
  var lista = document.getElementById('lista-jugadores-entreno');
  if (!cat.jugadores || !cat.jugadores.length) {
    lista.innerHTML = '<div style="padding:16px 0;color:var(--texto3);font-size:13px;text-align:center">Plantilla pendiente de configurar.</div>';
  } else {
    lista.innerHTML = cat.jugadores.map(function(p, i) {
      playerStatus[p] = 'presente';
      var ini = p.split(',')[0].trim().split(' ').map(function(w){ return w[0]||''; }).join('').slice(0,2).toUpperCase();
      var motOpts = MOTIVOS.map(function(m){ return '<option value="'+m+'">'+m+'</option>'; }).join('');
      return '<div class="player-item" id="pi-'+i+'">' +
        '<div class="avatar" style="background:'+COLORES[i%COLORES.length]+'">'+ini+'</div>' +
        '<span class="player-name-txt">'+p+'</span>' +
        '<div class="status-buttons">' +
          '<button class="status-btn sp" onclick="setPresente(\''+p.replace(/'/g,"\\'")+'\','+i+')">Asiste</button>' +
          '<button class="status-btn" onclick="mostrarMotivo(\''+p.replace(/'/g,"\\'")+'\','+i+')">No asiste</button>' +
        '</div>' +
        '<select id="mot-'+i+'" onchange="setMotivo(\''+p.replace(/'/g,"\\'")+'\',this.value)" style="display:none;margin-top:6px;width:100%;padding:8px 10px;border:0.5px solid var(--borde);border-radius:8px;font-size:13px;-webkit-appearance:none;background:#fff">'+motOpts+'</select>' +
      '</div>';
    }).join('');
  }
  actualizarResumen();
  selectedPills = {tac:[],fis:[],tec:[]};
  buildPills('pills-tacticos', TACTICOS, 'tac', 'p-tac');
  buildPills('pills-fisicos',  FISICOS,  'fis', 'p-fis');
  buildPills('pills-tecnicos', TECNICOS, 'tec', 'p-tec');
}
function setPresente(player, i) {
  playerStatus[player] = 'presente';
  var item = document.getElementById('pi-'+i);
  item.querySelectorAll('.status-btn').forEach(function(b){ b.classList.remove('sp','sa'); });
  item.querySelectorAll('.status-btn')[0].classList.add('sp');
  var mot = document.getElementById('mot-'+i); if(mot) mot.style.display='none';
  actualizarResumen();
}
function mostrarMotivo(player, i) {
  playerStatus[player] = 'Sin comunicar';
  var item = document.getElementById('pi-'+i);
  item.querySelectorAll('.status-btn').forEach(function(b){ b.classList.remove('sp'); b.classList.add('sa'); });
  var mot = document.getElementById('mot-'+i); if(mot){ mot.style.display='block'; mot.value='Sin comunicar'; }
  actualizarResumen();
}
function setMotivo(player, val) { playerStatus[player]=val; }
function actualizarResumen() {
  var vals=Object.values(playerStatus), pres=vals.filter(function(v){return v==='presente';}).length;
  document.getElementById('entreno-asistencia-resumen').textContent=pres+' presentes · '+(vals.length-pres)+' ausencias';
}
function buildPills(id, arr, tipo, cls) {
  document.getElementById(id).innerHTML=arr.map(function(p,i){
    return '<span class="pill" id="pill-'+tipo+'-'+i+'" onclick="togglePill(\''+tipo+'\','+i+',\''+p+'\',\''+cls+'\')">'+p+'</span>';
  }).join('');
}
function togglePill(tipo, i, val, cls) {
  var el=document.getElementById('pill-'+tipo+'-'+i), idx=selectedPills[tipo].indexOf(val);
  if(idx===-1){selectedPills[tipo].push(val);el.classList.add(cls);}else{selectedPills[tipo].splice(idx,1);el.classList.remove(cls);}
}
function buildPartidoUI() {
  document.getElementById('p-fecha').value=new Date().toISOString().split('T')[0];
  goalCount=0; document.getElementById('goals-list-entreno').innerHTML=''; cntValues={};
  document.getElementById('stats-counters').innerHTML=STATS_DEF.map(function(s){
    return '<div class="counter-item"><div class="counter-label">'+s[0]+'</div><div class="counter-ctrl"><button class="cnt-btn" onclick="cnt(\''+s[1]+'\',-1)">-</button><span class="cnt-num" id="c-'+s[1]+'">0</span><button class="cnt-btn" onclick="cnt(\''+s[1]+'\',1)">+</button></div></div>';
  }).join('');
}
function cnt(key,d){ cntValues[key]=Math.max(0,(cntValues[key]||0)+d); document.getElementById('c-'+key).textContent=cntValues[key]; }
function addGoal() {
  goalCount++;
  var div=document.createElement('div'); div.className='goal-row'; div.id='gr-'+goalCount; var id=goalCount;
  div.innerHTML='<input class="goal-min" type="number" placeholder="Min" min="1" max="120"><input class="goal-goleador" type="text" placeholder="Goleador"><select class="goal-tipo"><option>J</option><option>BP</option><option>P</option><option>AG</option></select><button class="del-btn" onclick="document.getElementById(\'gr-'+id+'\').remove()">x</button>';
  document.getElementById('goals-list-entreno').appendChild(div);
}
async function enviar(datos, tipo) {
  document.getElementById('overlay-txt').textContent='Guardando datos...';
  document.getElementById('overlay').classList.add('show');
  var registro=Object.assign({},datos,{tipo:tipo,equipo:equipoActual,entrenador:cfg.nombre,rol:cfg.rol,timestamp:new Date().toISOString()});
  var key='silos_reg_'+equipoActual;
  var ex=JSON.parse(localStorage.getItem(key)||'[]');
  ex.unshift(registro); localStorage.setItem(key,JSON.stringify(ex.slice(0,50)));
  try { await fetch(GOOGLE_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(registro)}); } catch(e){}
  document.getElementById('overlay').classList.remove('show');
}
async function enviarEntreno() {
  lastAction='entreno';
  var datos={
    fecha:document.getElementById('e-fecha').value, hora:document.getElementById('e-hora').value,
    duracion:document.getElementById('e-duracion').value, campo:document.getElementById('e-campo').value,
    objetivo:document.getElementById('e-objetivo').value, asistencia:JSON.stringify(playerStatus),
    presentes:Object.values(playerStatus).filter(function(v){return v==='presente';}).length,
    ausentes:Object.values(playerStatus).filter(function(v){return v!=='presente';}).length,
    principios_tacticos:selectedPills.tac.join(', '), principios_fisicos:selectedPills.fis.join(', '),
    principios_tecnicos:selectedPills.tec.join(', '), sistema:document.getElementById('e-sistema').value,
    intensidad:document.getElementById('e-intensidad').value, notas:document.getElementById('e-notas').value,
    destacado:document.getElementById('e-destacado').value
  };
  await enviar(datos,'entrenamiento'); mostrarExito('entrenamiento'); cargarUltimos();
}
async function enviarPartido() {
  lastAction='partido';
  var goles=[];
  document.querySelectorAll('[id^=gr-]').forEach(function(row){
    var inputs=row.querySelectorAll('input,select');
    if(inputs[0].value||inputs[1].value) goles.push({min:inputs[0].value,goleador:inputs[1].value,tipo:inputs[2].value});
  });
  var datos={
    jornada:document.getElementById('p-jornada').value, fecha:document.getElementById('p-fecha').value,
    rival:document.getElementById('p-rival').value, condicion:document.getElementById('p-condicion').value,
    resultado:document.getElementById('p-resultado').value, campo:document.getElementById('p-campo').value,
    goles:JSON.stringify(goles), sist_ataque:document.getElementById('pt-ataque').value,
    sist_defensa:document.getElementById('pt-defensa').value, tipo_ataque:document.getElementById('pt-tipo-ataque').value,
    tipo_defensa:document.getElementById('pt-tipo-defensa').value, repliegue:document.getElementById('pt-repliegue').value,
    valoracion:document.getElementById('pt-valoracion').value, notas:document.getElementById('pt-notas').value,
    destacado:document.getElementById('pt-destacado').value
  };
  STATS_DEF.forEach(function(s){ datos[s[1]]=cntValues[s[1]]||0; });
  if (fotoFichaBase64) datos.foto_base64 = fotoFichaBase64;
  await enviar(datos,'partido'); 
  fotoFichaBase64 = null;
  document.getElementById('foto-ficha-preview').style.display='none';
  document.getElementById('btn-foto-ficha').textContent='📷 Añadir foto del acta';
  mostrarExito('partido'); cargarUltimos();
}
function mostrarExito(tipo) {
  document.getElementById('exito-icon').textContent=tipo==='partido'?'⚽':'🏃';
  document.getElementById('exito-titulo').textContent=tipo==='partido'?'Partido guardado':'Entrenamiento guardado';
  document.getElementById('exito-desc').textContent='Enviado al sistema.';
  irA('s-exito');
}
var fotoFichaBase64 = null;
function previsualizarFichaPartido(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    fotoFichaBase64 = e.target.result;
    document.getElementById('foto-ficha-img').src = fotoFichaBase64;
    document.getElementById('foto-ficha-preview').style.display = 'block';
    document.getElementById('btn-foto-ficha').textContent = '✅ Foto añadida · Toca para cambiar';
  };
  reader.readAsDataURL(file);
}
function repetir() { irA(lastAction==='partido'?'s-partido':'s-entreno'); if(lastAction==='partido')buildPartidoUI();else buildEntrenoUI(); }
function cargarUltimos() {
  var key='silos_reg_'+equipoActual;
  var regs=JSON.parse(localStorage.getItem(key)||'[]').slice(0,5);
  var el=document.getElementById('ultimos-card');
  if(!regs.length){el.innerHTML='<div class="card-body" style="color:var(--texto3);font-size:13px;text-align:center;padding:20px">Aun no hay registros.</div>';return;}
  el.innerHTML='<div class="card-body" style="padding:0 16px">'+
    regs.map(function(r){
      var esP=r.tipo==='partido', fecha=r.fecha?r.fecha.split('-').reverse().join('/'):'';
      var badge=esP?'<span class="badge badge-azul">J'+(r.jornada||'?')+'</span>':'<span class="badge badge-verde">Entreno</span>';
      var right=esP?'<span style="font-weight:700">'+(r.resultado||'?')+'</span>':'<span style="color:var(--texto2);font-size:12px">'+(r.presentes||0)+' pres.</span>';
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid var(--borde)">'+
        '<div style="display:flex;align-items:center;gap:8px">'+badge+'<span style="font-size:13px">'+(esP?'vs '+r.rival:fecha)+'</span></div>'+right+'</div>';
    }).join('')+'</div>';
}
var observer=new MutationObserver(function(){
  if(document.getElementById('s-entreno').classList.contains('active')) buildEntrenoUI();
  if(document.getElementById('s-partido').classList.contains('active')) buildPartidoUI();
  if(document.getElementById('s-stats-entreno').classList.contains('active')) buildStatsEntreno();
  if(document.getElementById('s-stats-partido').classList.contains('active')) buildStatsPartido();
});
document.querySelectorAll('.screen').forEach(function(s){ observer.observe(s,{attributes:true,attributeFilter:['class']}); });
var sesion=localStorage.getItem('silos_sesion');
if(sesion){
  try{ cfg=JSON.parse(sesion); if(cfg.nombre) iniciarApp(); else irA('s-login'); }
  catch(e){ irA('s-login'); }
}else{ irA('s-login'); }
document.getElementById('l-contrasena').addEventListener('keydown',function(e){ if(e.key==='Enter')hacerLogin(); });
