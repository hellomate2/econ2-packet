
(function(){
"use strict";

/* ---------------- graph engine ---------------- */
var VW=340, VH=232, PL=44, PR=324, PT=14, PB=190;
function X(u){return PL+(PR-PL)*u/100;}
function Y(v){return PB-(PB-PT)*v/100;}
var C={d:"var(--demand)",s:"var(--supply)",g:"var(--gold)",gf:"var(--gold-fill)",
       a:"var(--accent)",i:"var(--ink)",m:"var(--muted)",r:"var(--rule-2)"};

function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function ln(x1,y1,x2,y2,c,lbl,lp,dash){return{k:"ln",x1:x1,y1:y1,x2:x2,y2:y2,c:c,lbl:lbl,lp:lp,dash:dash};}
function cv(p,c,lbl,lp){return{k:"cv",p:p,c:c,lbl:lbl,lp:lp};}
function ar(p,f,lbl,lx,ly,op){return{k:"ar",p:p,f:f,lbl:lbl,lx:lx,ly:ly,op:op};}
function dr(x,y,xl,yl){return{k:"dr",x:x,y:y,xl:xl,yl:yl};}
function dt(x,y,lbl,dx,dy){return{k:"dt",x:x,y:y,lbl:lbl,dx:dx,dy:dy};}
function tx(x,y,t,c,an,sz,w){return{k:"tx",x:x,y:y,t:t,c:c,an:an,sz:sz,w:w};}
function arw(x1,y1,x2,y2,c){return{k:"arw",x1:x1,y1:y1,x2:x2,y2:y2,c:c};}

function draw(spec){
  var o=[];
  o.push('<svg viewBox="0 0 '+VW+' '+VH+'" role="img" aria-label="'+esc(spec.alt||"diagram")+'">');
  o.push('<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="2.4" orient="auto">'+
         '<path d="M0,0 L6,2.4 L0,4.8 z" fill="'+C.m+'"/></marker></defs>');
  // axes
  o.push('<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(104)+'" y2="'+Y(0)+'" stroke="'+C.r+'" stroke-width="1.2"/>');
  o.push('<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(0)+'" y2="'+Y(104)+'" stroke="'+C.r+'" stroke-width="1.2"/>');
  o.push('<text x="'+X(104)+'" y="'+(Y(0)+15)+'" fill="'+C.m+'" font-size="10" font-family="var(--mono)" text-anchor="end">'+esc(spec.xl||"")+'</text>');
  o.push('<text x="'+(X(0)-4)+'" y="11" fill="'+C.m+'" font-size="10" font-family="var(--mono)" text-anchor="end">'+esc(spec.yl||"")+'</text>');

  (spec.it||[]).forEach(function(e){
    if(e.k==="ar"){
      var pts=e.p.map(function(q){return X(q[0])+","+Y(q[1]);}).join(" ");
      o.push('<polygon points="'+pts+'" fill="'+e.f+'" opacity="'+(e.op||.2)+'"/>');
      if(e.lbl) o.push('<text x="'+X(e.lx)+'" y="'+Y(e.ly)+'" fill="'+e.f+'" font-size="9.5" font-family="var(--mono)" text-anchor="middle">'+esc(e.lbl)+'</text>');
    }
    else if(e.k==="ln"){
      o.push('<line x1="'+X(e.x1)+'" y1="'+Y(e.y1)+'" x2="'+X(e.x2)+'" y2="'+Y(e.y2)+'" stroke="'+e.c+'" stroke-width="1.9"'+(e.dash?' stroke-dasharray="'+e.dash+'"':'')+' stroke-linecap="round"/>');
      if(e.lbl){
        var p=e.lp||[e.x2,e.y2], an=p[2]||"start";
        o.push('<text x="'+X(p[0])+'" y="'+Y(p[1])+'" fill="'+e.c+'" font-size="10.5" font-family="var(--mono)" font-weight="500" text-anchor="'+an+'">'+esc(e.lbl)+'</text>');
      }
    }
    else if(e.k==="cv"){
      var d=e.p.map(function(q,i){return (i?"L":"M")+X(q[0])+","+Y(q[1]);}).join(" ");
      o.push('<path d="'+d+'" fill="none" stroke="'+e.c+'" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>');
      if(e.lbl){var q=e.lp||e.p[e.p.length-1];
        o.push('<text x="'+X(q[0])+'" y="'+Y(q[1])+'" fill="'+e.c+'" font-size="10.5" font-family="var(--mono)" font-weight="500" text-anchor="'+(q[2]||"start")+'">'+esc(e.lbl)+'</text>');}
    }
    else if(e.k==="dr"){
      o.push('<line x1="'+X(0)+'" y1="'+Y(e.y)+'" x2="'+X(e.x)+'" y2="'+Y(e.y)+'" stroke="'+C.m+'" stroke-width=".9" stroke-dasharray="3 3" opacity=".8"/>');
      o.push('<line x1="'+X(e.x)+'" y1="'+Y(0)+'" x2="'+X(e.x)+'" y2="'+Y(e.y)+'" stroke="'+C.m+'" stroke-width=".9" stroke-dasharray="3 3" opacity=".8"/>');
      if(e.yl) o.push('<text x="'+(X(0)-5)+'" y="'+(Y(e.y)+3.4)+'" fill="'+C.i+'" font-size="9.5" font-family="var(--mono)" text-anchor="end">'+esc(e.yl)+'</text>');
      if(e.xl) o.push('<text x="'+X(e.x)+'" y="'+(Y(0)+13)+'" fill="'+C.i+'" font-size="9.5" font-family="var(--mono)" text-anchor="middle">'+esc(e.xl)+'</text>');
    }
    else if(e.k==="dt"){
      o.push('<circle cx="'+X(e.x)+'" cy="'+Y(e.y)+'" r="2.9" fill="'+C.i+'"/>');
      if(e.lbl) o.push('<text x="'+(X(e.x)+(e.dx===undefined?5:e.dx))+'" y="'+(Y(e.y)-(e.dy===undefined?5:e.dy))+'" fill="'+C.i+'" font-size="10" font-family="var(--mono)">'+esc(e.lbl)+'</text>');
    }
    else if(e.k==="tx"){
      o.push('<text x="'+X(e.x)+'" y="'+Y(e.y)+'" fill="'+(e.c||C.m)+'" font-size="'+(e.sz||9.5)+'" font-family="var(--mono)" font-weight="'+(e.w||400)+'" text-anchor="'+(e.an||"middle")+'">'+esc(e.t)+'</text>');
    }
    else if(e.k==="arw"){
      o.push('<line x1="'+X(e.x1)+'" y1="'+Y(e.y1)+'" x2="'+X(e.x2)+'" y2="'+Y(e.y2)+'" stroke="'+(e.c||C.m)+'" stroke-width="1.3" marker-end="url(#ah)"/>');
    }
  });
  o.push("</svg>");
  return o.join("");
}

/* standard supply & demand geometry: D (8,88)->(92,16); S (8,20)->(92,84); cross (50,52) */
var D1=[8,88,92,16], S1=[8,20,92,84];
function dY(x){return 88-(72/84)*(x-8);}
function sY(x){return 20+(64/84)*(x-8);}

var G={};

/* ---- 1. PPC ---- */
G["ppc-basic"]={xl:"Investment goods (I)",yl:"Consumption (C)",alt:"production possibilities curve",it:[
  cv([[6,88],[30,84],[52,74],[70,58],[82,36],[88,8]],C.a,"PPC",[88,14,"end"]),
  dt(40,80,"a",6,4), dt(74,50,"b",6,4), dt(86,80,"c",-4,-10), dt(38,44,"d",6,4),
  tx(86,88,"unattainable",C.m,"end",9),
  tx(34,34,"recession —",C.m,"start",9), tx(34,27,"resources idle",C.m,"start",9)
]};
G["ppc-shift"]={xl:"Investment goods (I)",yl:"Consumption (C)",alt:"PPC shifting outward",it:[
  cv([[6,70],[26,66],[46,57],[62,44],[72,26],[76,6]],C.r,"PPC₁",[60,30,"start"]),
  cv([[6,94],[32,89],[56,78],[76,60],[88,36],[94,8]],C.a,"PPC₂",[92,20,"end"]),
  arw(58,52,70,66,C.m),
  tx(30,20,"more labor, capital",C.m,"start",9), tx(30,13,"or technology",C.m,"start",9),
  dt(30,40,"d",6,4), tx(40,38,"recession stays inside",C.m,"start",8.5)
]};
G["island-ppc"]={xl:"Coconuts",yl:"Fish",alt:"island production possibilities with specialization",it:[
  ar([[6,90],[24,80],[80,10],[6,10]],C.gf,"gains",40,44,.18),
  ln(6,90,80,10,C.r,"no specialization",[74,20,"end"],"4 3"),
  cv([[6,90],[24,80],[80,10]],C.s,"with specialization",[26,90,"start"]),
  dr(24,80,"10","80"),
  tx(13,86,"Bill first",C.m,"start",8.5),
  tx(52,50,"slope −1",C.m,"start",8.5),
  tx(52,28,"slope −4",C.m,"start",8.5),
  tx(80,4,"30",C.m,"middle",9), tx(2,90,"90",C.m,"end",9)
]};

/* ---- 3. supply & demand ---- */
G["sd-equilibrium"]={xl:"Quantity",yl:"Price",alt:"supply and demand equilibrium",it:[
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S",[93,84]),
  dr(50,52,"Q₁","P₁"), dt(50,52),
  ln(8,72,92,72,C.m,"",null,"3 3"), ln(8,32,92,32,C.m,"",null,"3 3"),
  tx(66,75,"surplus",C.m,"middle",9), tx(40,26,"shortage",C.m,"middle",9),
  arw(60,72,72,72,C.m), arw(40,32,28,32,C.m)
]};
G["sd-shifts"]={xl:"Quantity",yl:"Price",alt:"shifts in supply and demand",it:[
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D₁",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S₁",[93,84]),
  ln(26,20,100,76,C.s,"S₂",[84,96,"end"],"5 3"),
  ln(26,88,100,22,C.d,"D₂",[46,94,"middle"],"5 3"),
  dt(50,52,"E₁",6,4),
  dt(64,62,"E₂ᴰ",5,3), dt(62,42,"E₂ˢ",5,-8),
  tx(20,34,"supply out ⇒ P↓ Q↑",C.s,"start",8.5),
  tx(20,27,"demand out ⇒ P↑ Q↑",C.d,"start",8.5)
]};

/* ---- 4. welfare ---- */
G["surplus"]={xl:"Quantity",yl:"Price",alt:"consumer and producer surplus",it:[
  ar([[8,88],[50,52],[8,52]],C.d,"CS",22,68,.24),
  ar([[8,20],[50,52],[8,52]],C.s,"PS",22,37,.24),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D, MB",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S, MC",[93,84]),
  dr(50,52,"Q₁","P₁"), dt(50,52)
]};
G["dwl-under"]={xl:"Quantity",yl:"Price",alt:"deadweight loss from underproduction",it:[
  ar([[32,74],[50,52],[32,38]],C.gf,"DWL",39,55,.42),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S",[93,84]),
  dr(50,52,"Q₁",""), dt(50,52),
  ln(32,0,32,74,C.m,"",null,"3 3"),
  tx(32,-7,"Q₂",C.i,"middle",9.5),
  tx(20,92,"MB > MC here",C.m,"start",9)
]};
G["dwl-over"]={xl:"Quantity",yl:"Price",alt:"deadweight loss from overproduction",it:[
  ar([[50,52],[70,69],[70,35]],C.gf,"DWL",62,52,.42),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S",[93,84]),
  dr(50,52,"Q₁",""), dt(50,52),
  ln(70,0,70,69,C.m,"",null,"3 3"),
  tx(70,-7,"Q₂",C.i,"middle",9.5),
  tx(20,92,"MC > MB here",C.m,"start",9)
]};
G["ceiling"]={xl:"Quantity",yl:"Price",alt:"binding price ceiling",it:[
  ar([[8,88],[30,69],[30,34],[8,34]],C.d,"CS",18,64,.2),
  ar([[8,20],[30,34],[8,34]],C.s,"PS",15,28,.24),
  ar([[30,69],[50,52],[30,34]],C.gf,"DWL",37,52,.42),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S",[93,84]),
  ln(8,34,92,34,C.a,"P_C",[93,33]),
  dt(50,52,"",0,0),
  ln(30,0,30,69,C.m,"",null,"3 3"), ln(70,0,70,34,C.m,"",null,"3 3"),
  tx(30,-7,"Q_S",C.i,"middle",9.5), tx(70,-7,"Q_D",C.i,"middle",9.5),
  arw(32,24,68,24,C.m), tx(50,15,"shortage",C.m,"middle",9)
]};

/* ---- 6. elasticity ---- */
G["elastic-vs-inelastic"]={xl:"Quantity",yl:"Price",alt:"elastic versus inelastic demand",it:[
  ln(40,94,60,8,C.d,"D inelastic",[38,96,"start"]),
  ln(8,66,92,38,C.d,"D elastic",[93,37],"5 3"),
  ln(8,20,92,84,C.s,"S₁",[93,84]),
  ln(26,10,100,74,C.s,"S₂",[80,96,"end"],"5 3"),
  dt(49,51), dt(56,37),
  tx(20,86,"same shift, steep D:",C.m,"start",8.5),
  tx(20,79,"price moves a lot",C.m,"start",8.5),
  tx(66,20,"flat D: quantity",C.m,"start",8.5),
  tx(66,13,"moves a lot",C.m,"start",8.5)
]};

/* ---- 7. tax & subsidy ---- */
G["tax-wedge"]={xl:"Quantity",yl:"Price",alt:"tax wedge with revenue and deadweight loss",it:[
  ar([[34,66],[50,52],[34,38]],C.gf,"DWL",41,52,.42),
  ar([[8,66],[34,66],[34,38],[8,38]],C.a,"revenue",21,52,.17),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S",[93,84]),
  ln(22,48,100,112,C.s,"S + tax",[64,98,"end"],"5 3"),
  dr(34,66,"Q₂","P₂"), dt(34,66), dt(34,38), dt(50,52),
  tx(6,38,"P₂−tax",C.i,"end",9.5),
  tx(50,42,"Q₁",C.m,"middle",9)
]};
G["tax-incidence"]={xl:"Quantity",yl:"Price",alt:"tax incidence with inelastic versus elastic demand",it:[
  ln(40,94,60,8,C.d,"inelastic D",[38,96,"start"]),
  ln(8,64,92,40,C.d,"elastic D",[93,39],"5 3"),
  ln(8,20,92,84,C.s,"S",[93,84]),
  ln(22,34,100,98,C.s,"S+tax",[78,96,"end"],"5 3"),
  dt(49,51), dt(47,65), dt(56,37), dt(52,60),
  arw(46,52,46,64,C.d),
  tx(30,80,"consumer price",C.d,"start",8.5), tx(30,73,"rises ≈ full tax",C.d,"start",8.5),
  tx(64,18,"consumer price",C.m,"start",8.5), tx(64,11,"barely moves",C.m,"start",8.5)
]};
G["subsidy"]={xl:"Quantity",yl:"Price",alt:"subsidy with government cost and deadweight loss",it:[
  ar([[50,52],[66,66],[66,38]],C.gf,"DWL",59,52,.42),
  ar([[8,66],[66,66],[66,38],[8,38]],C.a,"gov't cost",30,52,.15),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S",[93,84]),
  ln(-6,6,78,70,C.s,"S − subsidy",[16,4,"start"],"5 3"),
  dr(66,38,"Q₂","P_C"), dt(66,38), dt(66,66), dt(50,52),
  tx(6,66,"P_P",C.i,"end",9.5),
  tx(50,42,"Q₁",C.m,"middle",9)
]};

/* ---- 8. households ---- */
G["budget-constraint"]={xl:"Clothing (q_c)",yl:"Food (q_f)",alt:"budget constraint with shift and pivot",it:[
  ln(6,86,86,6,C.a,"BC₁",[58,38,"start"]),
  ln(6,86,46,6,C.d,"BC₂ (P_c ↑)",[16,24,"start"],"5 3"),
  ln(6,110,110,6,C.s,"BC₃ (income ↑)",[86,42,"start"],"5 3"),
  dr(6,86,"","5"), tx(86,-7,"2",C.i,"middle",9.5),
  tx(52,72,"slope = −P_c / P_f",C.m,"start",9),
  tx(52,65,"= −2.5",C.m,"start",9)
]};
G["utility-mu"]={xl:"Quantity consumed",yl:"Utility",alt:"total and marginal utility",it:[
  cv([[6,6],[20,32],[36,54],[54,70],[72,79],[90,82]],C.a,"total utility",[54,86,"start"]),
  cv([[6,60],[24,46],[42,33],[60,21],[78,11],[92,4]],C.d,"marginal utility",[62,30,"start"]),
  tx(20,74,"increasing but concave",C.m,"start",8.5),
  tx(20,16,"mu falls with quantity",C.m,"start",8.5)
]};

/* ---- 9. firms ---- */
G["firm-profit-max"]={xl:"Firm output (q)",yl:"$",alt:"competitive firm profit maximization",it:[
  cv([[8,14],[30,22],[52,38],[70,58],[84,82],[90,96]],C.s,"mc",[90,90,"end"]),
  ln(8,52,92,52,C.d,"mr = P₁",[93,51]),
  ln(8,72,92,72,C.d,"mr = P₂",[93,71],"5 3"),
  dr(63,52,"q₁",""), dt(63,52),
  dt(77,72,"",0,0), tx(77,-7,"q₂",C.m,"middle",9.5),
  tx(20,86,"price ↑ ⇒ slide up mc",C.m,"start",8.5),
  tx(20,79,"so mc curve = supply",C.m,"start",8.5)
]};
G["atc-mc"]={xl:"Firm output (q)",yl:"$",alt:"marginal cost, average total cost and profit",it:[
  ar([[8,66],[62,66],[62,44],[8,44]],C.s,"profit",34,54,.2),
  cv([[8,10],[26,20],[44,34],[62,52],[78,74],[88,94]],C.s,"mc",[88,88,"end"]),
  cv([[8,88],[20,64],[34,50],[48,44],[62,44],[76,50],[88,62]],C.a,"atc",[88,68,"start"]),
  ln(8,66,92,66,C.d,"mr = P₁",[93,65]),
  dr(62,66,"q₁","P₁"), dt(62,66), dt(62,44),
  tx(6,44,"atc₁",C.i,"end",9.5),
  tx(50,24,"mc cuts atc at its min",C.m,"middle",8.5)
]};
G["lr-supply"]={xl:"Firm output (q)",yl:"$",alt:"long-run industry supply",it:[
  cv([[8,10],[26,20],[44,34],[62,52],[78,74],[88,94]],C.s,"mc",[88,88,"end"]),
  cv([[8,88],[20,64],[34,50],[48,44],[62,44],[76,50],[88,62]],C.a,"atc",[88,68,"start"]),
  ln(8,44,92,44,C.d,"S_LR = min atc",[70,38,"middle"]),
  dr(55,44,"q*",""), dt(55,44),
  tx(30,74,"entry until P = mc = atc",C.m,"start",8.5),
  tx(30,67,"so profit = 0",C.m,"start",8.5)
]};

/* ---- 10. monopoly ---- */
G["monopoly"]={xl:"Quantity",yl:"Price",alt:"monopoly price, quantity and deadweight loss",it:[
  ar([[36,58],[58,44],[36,29]],C.gf,"DWL",45,44,.42),
  ln(8,88,92,16,C.d,"D, MB",[93,17]),
  ln(8,88,50,52,C.d,"MR",[27,65,"start"],"5 3"),
  ln(8,14,92,60,C.s,"MC",[93,60]),
  dr(36,58,"Q_m","P_m"), dt(36,58),
  dt(36,29), dt(58,44,"",0,0),
  tx(58,-7,"Q_c",C.m,"middle",9.5),
  tx(14,20,"① MR = MC ⇒ Q",C.a,"start",8.5),
  tx(14,13,"② read P off D",C.a,"start",8.5),
  tx(66,86,"MR is twice",C.d,"start",8.5), tx(66,79,"as steep as D",C.d,"start",8.5)
]};

/* ---- 11. externalities ---- */
G["neg-ext"]={xl:"Quantity",yl:"Price",alt:"negative externality",it:[
  ar([[36,63],[50,52],[36,43]],C.gf,"DWL",42,52,.42),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D = PMB = SMB",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"PMC",[93,84]),
  ln(8,43,92,107,C.g,"SMC",[70,96,"end"]),
  dt(50,52), dt(36,63),
  ln(36,0,36,63,C.m,"",null,"3 3"), ln(50,0,50,52,C.m,"",null,"3 3"),
  tx(36,-7,"Q*",C.i,"middle",9.5), tx(52,-7,"Q₁",C.i,"middle",9.5),
  tx(14,30,"external MC",C.g,"start",8.5),
  arw(20,26,20,38,C.g)
]};
G["pos-ext"]={xl:"Quantity",yl:"Price",alt:"positive externality",it:[
  ar([[50,52],[64,63],[64,42]],C.gf,"DWL",57,52,.42),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"PMB",[93,17]),
  ln(8,111,92,39,C.g,"SMB",[93,38]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S = PMC = SMC",[70,92,"end"]),
  dt(50,52), dt(64,63),
  ln(50,0,50,52,C.m,"",null,"3 3"), ln(64,0,64,63,C.m,"",null,"3 3"),
  tx(48,-7,"Q₁",C.i,"middle",9.5), tx(66,-7,"Q*",C.i,"middle",9.5),
  tx(16,30,"external MB",C.g,"start",8.5)
]};

/* ---- 12-13. labor ---- */
G["labor-market"]={xl:"Employment (L)",yl:"Wage (W)",alt:"labor market",it:[
  ln(8,88,92,16,C.d,"D = MRP_L",[93,17]),
  ln(8,20,92,84,C.s,"S",[93,84]),
  dr(50,52,"L₁","W₁"), dt(50,52),
  tx(20,32,"MRP_L = MP_L × MR",C.d,"start",9)
]};
G["skill-bias"]={xl:"Employment (L)",yl:"Wage (W)",alt:"skill-biased technological change",it:[
  ln(8,74,50,38,C.d,"D_L",[8,80,"start"]),
  ln(8,10,50,46,C.s,"S_L",[8,4,"start"]),
  dt(30,56,"",0,0), dr(30,56,"",""),
  tx(28,92,"LOW-SKILL",C.m,"middle",9,600),
  ln(56,74,98,38,C.d,"D_H1",[56,80,"start"]),
  ln(70,88,112,52,C.d,"D_H2",[88,92,"end"],"5 3"),
  ln(56,10,98,46,C.s,"S_H",[56,4,"start"]),
  dt(78,56,"",0,0), dt(86,63,"",0,0),
  tx(80,92,"HIGH-SKILL",C.m,"middle",9,600),
  arw(74,50,84,58,C.d),
  ln(53,0,53,100,C.r,"",null,"2 4")
]};
G["eitc"]={xl:"Employment (L)",yl:"Wage (W)",alt:"EITC as a wage subsidy",it:[
  ln(8,88,92,16,C.d,"D = MRP_L",[93,17]),
  ln(8,20,92,84,C.s,"S₁",[40,64,"end"]),
  ln(26,8,110,72,C.s,"S₂",[93,72],"5 3"),
  dt(50,52), dt(62,42),
  ln(8,42,62,42,C.m,"",null,"3 3"), ln(8,62,62,62,C.g,"",null,"3 3"),
  tx(6,52,"W₁",C.i,"end",9.5), tx(6,40,"W₂",C.i,"end",9.5),
  tx(6,62,"W₂+EITC",C.g,"end",9),
  tx(70,86,"supply shifts out;",C.m,"start",8.5),
  tx(70,79,"market wage falls",C.m,"start",8.5)
]};

/* ---- 14. capital ---- */
G["investment-demand"]={xl:"Investment (I)",yl:"Real interest rate (r)",alt:"investment demand",it:[
  cv([[8,92],[28,70],[50,50],[72,32],[92,18]],C.a,"I",[92,24,"end"]),
  cv([[26,96],[46,74],[68,54],[90,36]],C.a,"I′",[90,42,"end"],null),
  dr(50,50,"I₁","r₁"), dt(50,50),
  arw(52,62,64,68,C.m),
  tx(24,32,"higher r ⇒ lower PV of",C.m,"start",8.5),
  tx(24,25,"future MRP_K ⇒ less I",C.m,"start",8.5),
  tx(60,86,"tax credit or",C.m,"start",8.5), tx(60,79,"optimism shifts out",C.m,"start",8.5)
]};

/* ---- 15-16. trade ---- */
G["trade-ppc-cpc"]={xl:"Soybeans (S)",yl:"Washing machines (WM)",alt:"PPC and consumption possibilities curve",it:[
  cv([[6,84],[28,80],[50,70],[68,54],[80,32],[86,6]],C.s,"PPC",[30,72,"start"]),
  ln(6,100,94,12,C.a,"CPC",[94,18,"end"]),
  dt(54,66,"A",-14,4), dt(78,40,"B",6,2),
  arw(56,62,74,44,C.m),
  tx(20,32,"slope = −terms of trade",C.m,"start",8.5),
  tx(20,25,"CPC lies outside PPC",C.g,"start",8.5),
  tx(70,80,"produce at A,",C.m,"start",8.5), tx(70,73,"consume at B",C.m,"start",8.5)
]};
G["trade-export"]={xl:"Quantity",yl:"Price",alt:"export good with world price",it:[
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D_US",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S_US",[93,84]),
  ln(8,70,92,70,C.a,"P_world",[93,69]),
  dt(50,52,"",0,0),
  ln(25,0,25,70,C.m,"",null,"3 3"), ln(74,0,74,70,C.m,"",null,"3 3"),
  tx(25,-7,"Q_D",C.i,"middle",9.5), tx(74,-7,"Q_S",C.i,"middle",9.5),
  arw(28,60,71,60,C.g), tx(50,51,"exports",C.g,"middle",9)
]};
G["trade-import"]={xl:"Quantity",yl:"Price",alt:"import good with world price",it:[
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D_US",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S_US",[93,84]),
  ln(8,34,92,34,C.a,"P_world",[93,33]),
  dt(50,52,"",0,0),
  ln(25,0,25,34,C.m,"",null,"3 3"), ln(74,0,74,34,C.m,"",null,"3 3"),
  tx(25,-7,"Q_S",C.i,"middle",9.5), tx(74,-7,"Q_D",C.i,"middle",9.5),
  arw(28,44,71,44,C.g), tx(50,48,"imports",C.g,"middle",9)
]};
G["tariff"]={xl:"Quantity",yl:"Price",alt:"tariff welfare analysis",it:[
  ar([[33,48],[41,48],[33,34]],C.gf,"d",35,40,.45),
  ar([[62,48],[70,34],[62,34]],C.gf,"f",67,40,.45),
  ar([[41,48],[62,48],[62,34],[41,34]],C.a,"e",51,40,.17),
  ln(D1[0],D1[1],D1[2],D1[3],C.d,"D_US",[93,17]),
  ln(S1[0],S1[1],S1[2],S1[3],C.s,"S_US",[93,84]),
  ln(8,34,92,34,C.a,"P_world",[93,33]),
  ln(8,48,92,48,C.g,"P_w + tariff",[93,52]),
  tx(20,74,"a + b",C.d,"middle",9), tx(24,40,"c",C.s,"middle",9), tx(20,24,"g",C.s,"middle",9),
  ln(25,0,25,34,C.m,"",null,"2 3"), ln(33,0,33,48,C.m,"",null,"2 3"),
  ln(62,0,62,48,C.m,"",null,"2 3"), ln(74,0,74,34,C.m,"",null,"2 3"),
  tx(50,-7,"imports shrink from both sides",C.m,"middle",9)
]};

/* ---- 19. growth ---- */
G["growth-labor"]={xl:"Population / employment (L)",yl:"Real wage (W)",alt:"Malthusian trap and escape",it:[
  ln(8,86,72,22,C.d,"static D (pre-1800)",[70,16,"end"]),
  ln(28,104,96,36,C.d,"D shifts out (post-1800)",[94,30,"end"],"5 3"),
  ln(8,14,92,78,C.s,"S₁",[44,52,"end"]),
  ln(34,6,118,70,C.s,"S₂",[92,74],"5 3"),
  dt(28,66,"1300",-4,6), dt(46,48,"1650",6,2), dt(60,36,"1800",6,2),
  dt(76,60,"1860",6,2),
  arw(62,42,74,56,C.g),
  tx(16,34,"more people ⇒ lower wages",C.m,"start",8.5),
  tx(16,27,"= the Malthusian trap",C.m,"start",8.5)
]};

/* ---- 20-21. keynesian ---- */
G["keynesian-cross"]={xl:"Output, income (Y)",yl:"PAE",alt:"Keynesian cross",it:[
  ln(4,4,96,96,C.m,"Y = PAE (45°)",[92,100,"end"]),
  ln(4,30,96,64,C.a,"PAE",[96,58,"end"]),
  dr(39,39,"Y₁",""), dt(39,39),
  tx(6,34,"autonomous",C.a,"start",9),
  tx(68,30,"slope = mpc",C.a,"start",9),
  tx(20,74,"above: inventories pile up,",C.m,"start",8.5),
  tx(20,67,"firms cut production",C.m,"start",8.5)
]};
G["keynesian-shift"]={xl:"Output, income (Y)",yl:"PAE",alt:"multiplier effect",it:[
  ln(4,4,96,96,C.m,"45°",[94,100,"end"]),
  ln(4,36,96,70,C.a,"PAE₁",[96,66,"end"]),
  ln(4,22,96,56,C.d,"PAE₂",[96,48,"end"],"5 3"),
  dt(48,48,"",0,0), dt(27,27,"",0,0),
  ln(48,0,48,48,C.m,"",null,"3 3"), ln(27,0,27,27,C.m,"",null,"3 3"),
  tx(48,-7,"Y₁",C.i,"middle",9.5), tx(25,-7,"Y₂",C.i,"middle",9.5),
  arw(10,36,10,23,C.d), tx(14,28,"ΔPAE",C.d,"start",9),
  arw(46,14,29,14,C.g), tx(37,6,"ΔY is larger",C.g,"middle",9)
]};
G["fiscal-offset"]={xl:"Output, income (Y)",yl:"PAE",alt:"fiscal policy offsetting a shock",it:[
  ln(4,4,96,96,C.m,"45°",[94,100,"end"]),
  ln(4,36,96,70,C.a,"PAE₁, PAE₃",[96,74,"end"]),
  ln(4,22,96,56,C.d,"PAE₂",[96,50,"end"],"5 3"),
  dt(48,48,"",0,0), dt(27,27,"",0,0),
  ln(48,0,48,48,C.m,"",null,"3 3"), ln(27,0,27,27,C.m,"",null,"3 3"),
  tx(50,-7,"Y*",C.i,"middle",9.5), tx(25,-7,"Y₂",C.i,"middle",9.5),
  arw(14,24,14,35,C.s), tx(18,28,"tax cut or ↑G",C.s,"start",8.5),
  tx(56,22,"timing and magnitude",C.m,"start",8.5),
  tx(56,15,"are the hard part",C.m,"start",8.5)
]};

/* ---- 23. inflation ---- */
G["reaction-function"]={xl:"Inflation (π)",yl:"Real interest rate (r)",alt:"the Fed reaction function",it:[
  ln(8,14,88,86,C.a,"RF₁",[88,80,"end"]),
  ln(8,40,76,101,C.d,"RF₂",[66,96,"end"],"5 3"),
  ln(0,50,96,50,C.m,"r*",[96,54,"end"],"3 3"),
  dt(48,50,"",0,0), dt(20,50,"",0,0),
  ln(48,0,48,50,C.m,"",null,"3 3"), ln(20,0,20,50,C.m,"",null,"3 3"),
  tx(50,-7,"π_target1",C.i,"middle",9), tx(18,-7,"π_target2",C.i,"middle",9),
  tx(30,84,"shift RF up ⇒",C.d,"start",8.5),
  tx(30,77,"lower long-run inflation",C.d,"start",8.5)
]};
G["return-to-potential"]={xl:"Output (Y)",yl:"PAE",alt:"return to potential output",it:[
  ln(4,4,96,96,C.m,"45°",[94,100,"end"]),
  ln(4,20,96,54,C.d,"PAE₁",[96,46,"end"],"5 3"),
  ln(4,34,96,68,C.a,"PAE_LR",[96,72,"end"]),
  dt(24,24,"",0,0), dt(46,46,"",0,0),
  ln(24,0,24,24,C.m,"",null,"3 3"), ln(46,0,46,46,C.m,"",null,"3 3"),
  tx(22,-7,"Y₁",C.i,"middle",9.5), tx(48,-7,"Y*",C.i,"middle",9.5),
  arw(34,16,44,16,C.g),
  tx(58,26,"π falls ⇒ Fed cuts r",C.m,"start",8.5),
  tx(58,19,"⇒ PAE rises ⇒ Y → Y*",C.m,"start",8.5)
]};

/* ---- 24. international macro ---- */
G["fx-market"]={xl:"Quantity of $ traded",yl:"Price of $ (¥ per $)",alt:"foreign exchange market for dollars",it:[
  ln(8,88,92,16,C.d,"D₁",[62,38,"start"]),
  ln(24,100,108,28,C.d,"D₂",[93,26],"5 3"),
  ln(8,20,92,84,C.s,"S₁",[44,52,"end"]),
  ln(-8,32,76,96,C.s,"S₂",[74,100,"end"],"5 3"),
  dt(50,52,"e₁",-14,2), dt(56,70,"e₂",6,2),
  arw(46,62,44,76,C.d), arw(62,48,58,40,C.s),
  tx(16,30,"both shifts raise",C.g,"start",8.5),
  tx(16,23,"the price: $ appreciates",C.g,"start",8.5)
]};
G["saving-investment"]={xl:"I*, S* + NKI*",yl:"Real interest rate (r*)",alt:"long-run real interest rate",it:[
  ln(8,88,92,16,C.d,"I",[93,17]),
  ln(8,16,92,88,C.s,"S + NKI",[93,88]),
  dr(50,52,"I* = S* + NKI*","r*"), dt(50,52),
  tx(20,30,"r* clears saving plus",C.m,"start",8.5),
  tx(20,23,"capital inflows against I",C.m,"start",8.5)
]};

/* render */
document.querySelectorAll("[data-graph]").forEach(function(el){
  var s=G[el.getAttribute("data-graph")];
  if(s) el.innerHTML=draw(s);
  else el.innerHTML='<div style="padding:18px;color:var(--muted);font-size:13px">Diagram unavailable.</div>';
});


})();
