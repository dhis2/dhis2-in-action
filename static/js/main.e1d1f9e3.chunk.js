(this["webpackJsonpdhis2-in-action"]=this["webpackJsonpdhis2-in-action"]||[]).push([[0],{132:function(e,t,n){},136:function(e,t,n){},138:function(e,t,n){},139:function(e,t,n){},140:function(e,t,n){},141:function(e,t,n){},145:function(e,t,n){},146:function(e,t,n){},147:function(e,t,n){},148:function(e,t,n){},149:function(e,t,n){},151:function(e,t,n){"use strict";n.r(t);n(83),n(96),n(98),n(99),n(101),n(103),n(114),n(115),n(120),n(121),n(123),n(124),n(125);var a=n(0),r=n.n(a),c=n(73),o=n.n(c),i=(n(132),n(1)),l=n(74),u=n.n(l),s=(n(136),function(e){var t=e.children,n=Object(a.useState)(!1),c=Object(i.a)(n,2),o=c[0],l=c[1];return r.a.createElement(u.a,{enabled:o,onChange:l},t,r.a.createElement("div",{className:"Fullscreen Fullscreen-".concat(o?"en":"dis","abled"),onClick:function(){return l(!o)}}))}),f=n(75),d=(n(138),function(e){var t=e.type,n=e.onClick;return r.a.createElement("div",{className:"SidebarToggle SidebarToggle-".concat(t),onClick:n},"open"===t?r.a.createElement(r.a.Fragment,null,"Map options",r.a.createElement("span",null,">")):r.a.createElement(r.a.Fragment,null,r.a.createElement("span",null,"<"),"Close map options"))}),m=(n(139),function(e){var t=e.items,n=e.data,c=Object(a.useMemo)((function(){return n?n.year[n.lastYear]:{}}),[n]);return r.a.createElement("div",{className:"Legend"},t.map((function(e){var t=e.code,n=e.name,a=e.color;return r.a.createElement("div",{key:t},r.a.createElement("span",{style:{backgroundColor:a}})," ",n," (",c[t],")")})))}),p=(n(140),function(e){var t=e.id,n=e.title,a=e.legend,c=e.selected,o=e.data,i=e.onClick;return r.a.createElement("div",{onClick:function(){return i(t)},className:"Category".concat(c?" Category-selected":"")},r.a.createElement("h2",null,n),c&&r.a.createElement(m,{items:a,data:o}))}),h=n(31),g=n(16),b=n(77),v=n.n(b),y=[{id:"health",title:"Health Information System",legend:[{code:"s",name:"National",color:"#238443"},{code:"i",name:"Indian State",color:"#78c679"},{code:"p",name:"Pilot",color:"#d9f0a3"}],hasChart:!0},{id:"covid-19",title:"COVID-19",legend:[{code:"c",name:"Operational",color:"#d95f0e"},{code:"v",name:"In development",color:"#fec44f"}],hasChart:!1},{id:"tracker",title:"Tracker",legend:[{code:"t",name:"Tracker",color:"#e34a33"}],hasChart:!0},{id:"android",title:"Android app",legend:[{code:"a",name:"Android app",color:"#2ca25f"}],hasChart:!0},{id:"who",title:"WHO Packages",legend:[{code:"w",name:"WHO Packages",color:"#1d91c0"}],hasChart:!1},{id:"emis",title:"Education Management Information System (EMIS)",legend:[{code:"e",name:"DHIS2 for Education",color:"#ae017e"}],hasChart:!1}],O=y.flatMap((function(e){return e.legend})).reduce((function(e,t){var n=t.code;return Object(g.a)({},e,Object(h.a)({},n,0))}),{}),E=function(e,t){return e["gsx$".concat(t)].$t},j=function(e){var t=e.feed.entry,n=t[0],a=[];for(var r in n)n.hasOwnProperty(r)&&"gsx$y"===r.slice(0,5)&&a.push(r.slice(-4));var c=a[a.length-1],o={},i={};return t.forEach((function(e){var t=E(e,"code"),n=E(e,"name");if(t){var r=o[t]={name:n};a.forEach((function(n){var a=E(e,"y".concat(n));t.startsWith("IN-")&&(a=a.replace("s","").replace("p","")),a.length&&(r[n]=a,i[n]||(i[n]=Object(g.a)({},O)),a.split("").forEach((function(e){i[n][e]++})))}))}})),{countries:o,year:i,years:a,lastYear:c}},k=function(e){var t=e.feed.entry,n={};return t.forEach((function(e){var t=E(e,"countrycode"),a=E(e,"letter"),r=E(e,"title"),c=E(e,"body"),o=E(e,"imageurl"),i=E(e,"imagelink"),l=E(e,"youtubeid"),u=E(e,"readmorelink");n[t]||(n[t]={}),n[t][a]={title:r,body:c,imageurl:o,imagelink:i,youtubeid:l,readmorelink:u}})),n},C=function(e){return v()("//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/".concat(e,"/public/values?alt=json-in-script"),{jsonpCallback:"callback"}).then((function(e){return e.json()}))},S=function(e){var t=e.category,n=e.data,a=e.isDocked,c=e.onClose,o=e.onSelect;return r.a.createElement(r.a.Fragment,null,!a&&r.a.createElement(d,{type:"close",onClick:c}),r.a.createElement("div",{className:"Sidebar-header"},r.a.createElement("h1",null,"DHIS2 in action"),r.a.createElement("p",null,"DHIS2 is in use all over the world. Check out different use cases with this interactive map.")),y.map((function(e){return r.a.createElement(p,Object.assign({key:e.id,onClick:o,selected:t===e.id,data:n},e))})))},w=(n(141),function(e){var t=e.category,n=e.data,c=e.onSelect,o=e.children,l=Object(a.useState)(!0),u=Object(i.a)(l,2),s=u[0],m=u[1],p=Object(a.useState)(!1),h=Object(i.a)(p,2),g=h[0],b=h[1];return Object(a.useEffect)((function(){var e=window.matchMedia("(min-width: 700px)");e.addListener((function(){return b(e.matches)})),b(e.matches)}),[]),r.a.createElement(f.a,{sidebar:r.a.createElement(S,{category:t,data:n,onSelect:c,isDocked:g,onClose:function(){return m(!1)}}),open:s,docked:g,onSetOpen:function(){return m(!0)},rootClassName:"App",contentClassName:"App-main",overlayClassName:"App-overlay",sidebarClassName:"Sidebar"},s&&!g&&r.a.createElement("div",{className:"App-mask",onClick:function(){return m(!1)}}),o,!s&&!g&&r.a.createElement(d,{type:"open",onClick:function(){return m(!0)}}))}),N=n(5),_=n.n(N),x=n(78),M=(n(142),N.GeoJSON.extend({options:{style:{color:"#333",weight:1},interval:20},initialize:function(e){_.a.Util.setOptions(this,e),this._layers={},this.options.sphere?this.addData(this._getFrame()):this.addData(this._getGraticule())},_getFrame:function(){return{type:"Polygon",coordinates:[this._getMeridian(-180).concat(this._getMeridian(180).reverse())]}},_getGraticule:function(){for(var e=[],t=this.options.interval,n=0;n<=180;n+=t)e.push(this._getFeature(this._getMeridian(n),{name:n?n.toString()+"\xb0 E":"Prime meridian"})),0!==n&&e.push(this._getFeature(this._getMeridian(-n),{name:n.toString()+"\xb0 W"}));for(var a=0;a<=90;a+=t)e.push(this._getFeature(this._getParallel(a),{name:a?a.toString()+"\xb0 N":"Equator"})),0!==a&&e.push(this._getFeature(this._getParallel(-a),{name:a.toString()+"\xb0 S"}));return{type:"FeatureCollection",features:e}},_getMeridian:function(e){e=this._lngFix(e);for(var t=[],n=-90;n<=90;n++)t.push([e,n]);return t},_getParallel:function(e){for(var t=[],n=-180;n<=180;n++)t.push([this._lngFix(n),e]);return t},_getFeature:function(e,t){return{type:"Feature",geometry:{type:"LineString",coordinates:e},properties:t}},_lngFix:function(e){return e>=180?179.999999:e<=-180?-179.999999:e}})),L=n(79),F=n.n(L),I=n(80),P=n.n(I),A=function(e){var t=e.type,n=e.coordinates,a=n;if("MultiPolygon"===t){var r=n.map((function(e){return F()({type:"Polygon",coordinates:e})}));a=n[r.indexOf(Math.max.apply(null,r))]}return P()(a,.1)},D=(n(145),[[-40,-100],[50,165]]),T=function(e){var t=e.category,n=e.data,c=e.focus,o=e.selected,l=e.onClick,u=Object(a.useState)(),s=Object(i.a)(u,2),f=s[0],d=s[1],m=Object(a.useState)(),p=Object(i.a)(m,2),h=p[0],b=p[1],v=Object(a.useRef)(),O=Object(a.useMemo)((function(){return y.find((function(e){return e.id===t})).legend}),[t]),E=Object(a.useCallback)((function(e){var t=e.latlng,a=function(e,t,n,a){var r=e.properties,c=r.CODE,o=r.NAME,i=t.countries[c],l="<h2>".concat(o,"</h2>");if(i){var u=n&&n[c],s=a.map((function(e){return Object(g.a)({},e,{year:t.years.find((function(t){return i[t]&&i[t].includes(e.code)}))})})).filter((function(e){return e.year}));if(u){var f=s.map((function(e){return e.code})).find((function(e){return!!u[e]}));if(f){var d=u[f],m=d.title,p=d.body,h=d.imageurl,b=d.imagelink,v=d.youtubeid,y=d.readmorelink;l+="<h3>".concat(m,"</h3>").concat(p),v?l+='<div class="aspect-ratio"><iframe src="https://www.youtube.com/embed/'.concat(v,'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'):h&&(l+="".concat(h?"".concat(b?'<a href="'.concat(b,'" target="_blank">'):"",'<img src="').concat(h,'" />').concat(b?"</a>":""):"")),y&&(l+='<p><a href="'.concat(y,'" target="_blank">Learn more</a></p>'))}}else l+=s.map((function(e){var t=e.name,n=e.year;return"".concat(t.includes("National")?c.includes("-")?"State":"National":t,": ").concat(n)})).join("<br/>")}return l}(e.layer.feature,n,c,O),r=v.current,o=r.clientWidth,i=o<400?o-100:300,u=r.clientHeight-100;Object(N.popup)({maxWidth:i,maxHeight:u}).setLatLng(t).setContent(a).openOn(f),l()}),[f,v,O,n,c,l]),j=Object(a.useCallback)((function(){return document.body.classList.add("popupopen")}),[]),k=Object(a.useCallback)((function(){return document.body.classList.remove("popupopen")}),[]);return Object(a.useEffect)((function(){d(Object(N.map)(v.current,{crs:new x.CRS("ESRI:53009","+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs",{resolutions:[5e4,4e4,3e4,2e4,1e4,5e3,2500,1250]}),maxZoom:7}).fitBounds(D))}),[v]),Object(a.useEffect)((function(){f&&(new M({sphere:!0,style:{opacity:0,fillColor:"#edf7ff",fillOpacity:1,clickable:!1}}).addTo(f),fetch("./countries_indian_states.json").then((function(e){return e.json()})).then((function(e){b(Object(N.geoJSON)(e,{color:"#555",weight:1,fillColor:"#fff",fillOpacity:.75}).addTo(f)),f.invalidateSize()})).catch((function(e){return console.log(e)})))}),[f,b]),Object(a.useEffect)((function(){if(h&&O&&n){var e=n.countries,t=n.lastYear;h.eachLayer((function(e){return e.setStyle({fillColor:"#fff"})})),h.eachLayer((function(n){var a=n.feature.properties.CODE;if(a&&e[a]&&e[a][t]){var r=e[a],c=r[t];n.feature.properties.NAME=r.name,"IN"===a&&(O.some((function(e){var t=e.code;return c.includes(t)}))?n.bringToFront():n.bringToBack()),O.forEach((function(e){var t=e.code,a=e.color;-1!==c.indexOf(t)&&n.setStyle({fillColor:a})}))}}))}}),[h,O,n]),Object(a.useEffect)((function(){return h&&h.on("click",E),function(){h&&h.off("click",E)}}),[h,n,c,E]),Object(a.useEffect)((function(){if(f&&h&&O&&c){var e,t=h.getLayers().filter((function(e){var t=e.feature.properties.CODE;return c[t]&&O.some((function(e){return c[t][e.code]}))})).map((function(e){var t=e.feature;return Object(g.a)({},t,{geometry:{type:"Point",coordinates:A(t.geometry)}})}));if(t.length){var n={icon:Object(N.icon)({iconUrl:"icon-info-48.png",iconSize:[20,20]})};return e=Object(N.geoJSON)(t,{pointToLayer:function(e,t){return Object(N.marker)(t,n)}}).on("click",E),f.addLayer(e),function(){e&&(e.off("click",E),f.removeLayer(e))}}}}),[f,h,O,c,n,E]),Object(a.useEffect)((function(){if(o&&h){var e=h.getLayers().find((function(e){return e.feature.properties.NAME===o}));e&&E({layer:e,latlng:A(e.feature.geometry).reverse()})}}),[o,h,E]),Object(a.useEffect)((function(){return f&&(f.on("popupopen",j),f.on("popupclose",k)),function(){f&&(f.off("popupopen",j),f.off("popupclose",k))}}),[f,j,k]),r.a.createElement("div",{ref:v,className:"Map"})},H=n(81),W=(n(146),function(e){var t=e.category,n=e.data,c=e.show,o=Object(a.useState)(),l=Object(i.a)(o,2),u=l[0],s=l[1],f=Object(a.useRef)();return Object(a.useEffect)((function(){s(Object(H.chart)("chart",{chart:{type:"area",marginTop:4},title:{text:null},xAxis:{tickmarkPlacement:"on",title:{enabled:!1}},yAxis:{title:{text:"Countries using DHIS2"}},tooltip:{split:!0},plotOptions:{area:{stacking:"normal",lineColor:"#666666",lineWidth:1,marker:{lineWidth:1,lineColor:"#666666"}}},series:[],legend:{enabled:!1}}))}),[f]),Object(a.useEffect)((function(){if(n){var e=u.series,a=u.xAxis,r=u.yAxis,c=y.find((function(e){return e.id===t})),o=c.title,i=c.legend,l=n.years,s=n.year;u.reflow();for(var f=l.slice(l.findIndex((function(e){return i.some((function(t){var n=t.code;return s[e][n]}))})));e.length;)e[0].remove();a[0].setCategories(f),r[0].setTitle({text:"".concat(o," implementations")}),i.slice().reverse().forEach((function(e){var t=e.code,n=e.name,a=e.color;return u.addSeries({name:n,data:f.map((function(e){return s[e][t]})),color:a})}))}}),[u,t,n]),Object(a.useEffect)((function(){u&&c&&u.reflow()}),[u,c]),r.a.createElement("div",{id:"chart",ref:f,className:"Chart Chart-".concat(c?"show":"hide")})}),J=(n(147),function(e){var t=e.category,n=e.data,c=e.show,o=e.focus,l=e.onClick,u=Object(a.useRef)(),s=Object(a.useState)(null),f=Object(i.a)(s,2),d=f[0],m=f[1],p=Object(a.useMemo)((function(){return y.find((function(e){return e.id===t})).legend}),[t]),h=Object(a.useMemo)((function(){if(p&&n){var e=n.countries,t=n.lastYear;return m(null),p.map((function(n){var a=n.code;return{name:n.name,color:n.color,items:Object.values(e).filter((function(e){var n=e[t];return n&&-1!==n.indexOf(a)}),[]).map((function(e){return e.name})).sort(),focus:(o?Object.keys(e).filter((function(e){return o[e]&&o[e][a]})):[]).map((function(t){return e[t].name}))}}))}}),[p,n,o]),g=Object(a.useCallback)((function(){if(h&&u.current){var e=u.current.clientHeight,t=Math.floor((e-70-20)/20),n=h.map((function(e){var n=e.items;return Math.ceil(n.length/t)}));m(n)}}),[u,h]);return Object(a.useEffect)((function(){return c&&(window.addEventListener("resize",g),g()),function(){return window.removeEventListener("resize",g)}}),[c,g]),r.a.createElement("div",{id:"list",ref:u,className:"List List-".concat(c?"show":"hide")},r.a.createElement("div",{className:"container"},d&&h&&h.map((function(e,t){var n=e.name,a=e.color,c=e.items,o=e.focus,i=d[t];return r.a.createElement("div",{key:n,className:"section",style:{flexGrow:i,flexShrink:i}},r.a.createElement("h2",null,r.a.createElement("span",{style:{backgroundColor:a}}),n,": ",c.length),r.a.createElement("ul",{style:{columnCount:i}},c.map((function(e){return r.a.createElement("li",{key:e,onClick:function(){return l(e)}},e,o.includes(e)?r.a.createElement("img",{src:"icon-info-48.png",alt:"More information"}):"")}))))}))))}),z=(n(148),function(e){var t=e.category,n=e.data,c=e.focus,o=e.onClick,l=Object(a.useState)(!0),u=Object(i.a)(l,2),s=u[0],f=u[1],d=y.find((function(e){return e.id===t})).hasChart;return r.a.createElement("div",{className:"ChartList"},r.a.createElement("div",{className:"menu"},d&&r.a.createElement("div",{className:"toggle",onClick:function(){return f(!s)}},s?"View list of implementations":"View chart of adoption over time")),r.a.createElement("div",{className:"wrapper",style:{top:d?30:5}},r.a.createElement(W,{category:t,data:n,show:d&&s}),r.a.createElement(J,{category:t,data:n,show:!s||!d,focus:c,onClick:o})))}),R=(n(149),function(){var e=Object(a.useState)(function(){var e=window.location.hash;if(e){var t=e.substr(1);if(y.find((function(e){return e.id===t})))return t}return"health"}()),t=Object(i.a)(e,2),n=t[0],c=t[1],o=Object(a.useState)(),l=Object(i.a)(o,2),u=l[0],f=l[1],d=Object(a.useState)(),m=Object(i.a)(d,2),p=m[0],h=m[1],g=Object(a.useState)(),b=Object(i.a)(g,2),v=b[0],O=b[1];return Object(a.useEffect)((function(){C(1).then(j).then(f)}),[]),Object(a.useEffect)((function(){u&&C(2).then(k).then(h)}),[u]),Object(a.useEffect)((function(){window.location.hash="#".concat(n),O()}),[n]),r.a.createElement(s,null,r.a.createElement(w,{category:n,data:u,onSelect:c},r.a.createElement(T,{category:n,data:u,focus:p,selected:v,onClick:O}),r.a.createElement(z,{category:n,data:u,focus:p,onClick:O})))});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(R,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},82:function(e,t,n){e.exports=n(151)}},[[82,1,2]]]);
//# sourceMappingURL=main.e1d1f9e3.chunk.js.map