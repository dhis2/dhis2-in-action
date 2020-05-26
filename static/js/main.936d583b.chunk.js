(this["webpackJsonpdhis2-in-action"]=this["webpackJsonpdhis2-in-action"]||[]).push([[0],[,,,,,,,,,,,,,,,,,function(e,t,n){e.exports=n(41)},,,,,function(e,t,n){},,,,function(e,t,n){},,function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},,,,function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},,function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),c=n(8),o=n.n(c),i=(n(22),n(1)),l=n(9),u=n.n(l),s=(n(26),function(e){var t=e.children,n=Object(a.useState)(!1),c=Object(i.a)(n,2),o=c[0],l=c[1];return r.a.createElement(u.a,{enabled:o,onChange:l},t,r.a.createElement("div",{className:"Fullscreen Fullscreen-".concat(o?"en":"dis","abled"),onClick:function(){return l(!o)}}))}),f=n(10),d=(n(28),function(e){var t=e.type,n=e.onClick;return r.a.createElement("div",{className:"SidebarToggle SidebarToggle-".concat(t),onClick:n},"open"===t?r.a.createElement(r.a.Fragment,null,"Map options",r.a.createElement("span",null,">")):r.a.createElement(r.a.Fragment,null,r.a.createElement("span",null,"<"),"Close map options"))}),m=(n(29),function(e){var t=e.items,n=e.data,c=Object(a.useMemo)((function(){return n?n.year[n.lastYear]:{}}),[n]);return r.a.createElement("div",{className:"Legend"},t.map((function(e){var t=e.code,n=e.name,a=e.color;return r.a.createElement("div",{key:t},r.a.createElement("span",{style:{backgroundColor:a}})," ",n," (",c[t],")")})))}),p=(n(30),function(e){var t=e.id,n=e.title,a=e.legend,c=e.selected,o=e.data,i=e.onClick;return r.a.createElement("div",{onClick:function(){return i(t)},className:"Category".concat(c?" Category-selected":"")},r.a.createElement("h2",null,n),c&&r.a.createElement(m,{items:a,data:o}))}),h=n(12),g=n.n(h),b=[{id:"health",title:"Health Information System",legend:[{code:"s",name:"National",color:"#238443"},{code:"i",name:"Indian State",color:"#78c679"},{code:"p",name:"Pilot",color:"#d9f0a3"}],hasChart:!0},{id:"covid-19",title:"COVID-19",legend:[{code:"c",name:"Operational",color:"#d95f0e"},{code:"v",name:"In development",color:"#fec44f"}],hasChart:!1},{id:"tracker",title:"Tracker",legend:[{code:"t",name:"Tracker",color:"#e34a33"}],hasChart:!0},{id:"android",title:"Android app",legend:[{code:"a",name:"Android app",color:"#2ca25f"}],hasChart:!0},{id:"emis",title:"Education Management Information System (EMIS)",legend:[{code:"e",name:"DHIS2 for Education",color:"#1d91c0"}],hasChart:!1}],v=function(e,t){return e["gsx$".concat(t)].$t},y=function(e){var t=e.feed.entry,n=t[0],a=[];for(var r in n)n.hasOwnProperty(r)&&"gsx$y"===r.slice(0,5)&&a.push(r.slice(-4));var c=a[a.length-1],o={},i={};return t.forEach((function(e){var t=v(e,"code"),n=v(e,"name");if(t){var r=o[t]={name:n};a.forEach((function(n){var a=v(e,"y".concat(n));t.startsWith("IN-")&&(a=a.replace("s","").replace("p","")),a.length&&(r[n]=a,i[n]||(i[n]={p:0,s:0,i:0,t:0,a:0,e:0,c:0,v:0}),a.split("").forEach((function(e){i[n][e]++})))}))}})),{countries:o,year:i,years:a,lastYear:c}},O=function(e){var t=e.feed.entry,n={};return t.forEach((function(e){var t=v(e,"countrycode"),a=v(e,"letter"),r=v(e,"title"),c=v(e,"body"),o=v(e,"imageurl"),i=v(e,"imagelink"),l=v(e,"youtubeid"),u=v(e,"readmorelink");n[t]||(n[t]={}),n[t][a]={title:r,body:c,imageurl:o,imagelink:i,youtubeid:l,readmorelink:u}})),n},E=function(e){return g()("//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/".concat(e,"/public/values?alt=json-in-script"),{jsonpCallback:"callback"}).then((function(e){return e.json()}))},j=function(e){var t=e.category,n=e.data,a=e.isDocked,c=e.onClose,o=e.onSelect;return r.a.createElement(r.a.Fragment,null,!a&&r.a.createElement(d,{type:"close",onClick:c}),r.a.createElement("div",{className:"Sidebar-header"},r.a.createElement("h1",null,"DHIS2 in action"),r.a.createElement("p",null,"DHIS2 is in use all over the world. Check out different use cases with this interactive map.")),b.map((function(e){return r.a.createElement(p,Object.assign({key:e.id,onClick:o,selected:t===e.id,data:n},e))})))},k=(n(31),function(e){var t=e.category,n=e.data,c=e.onSelect,o=e.children,l=Object(a.useState)(!0),u=Object(i.a)(l,2),s=u[0],m=u[1],p=Object(a.useState)(!1),h=Object(i.a)(p,2),g=h[0],b=h[1];return Object(a.useEffect)((function(){var e=window.matchMedia("(min-width: 700px)");e.addListener((function(){return b(e.matches)})),b(e.matches)}),[]),r.a.createElement(f.a,{sidebar:r.a.createElement(j,{category:t,data:n,onSelect:c,isDocked:g,onClose:function(){return m(!1)}}),open:s,docked:g,onSetOpen:function(){return m(!0)},rootClassName:"App",contentClassName:"App-main",overlayClassName:"App-overlay",sidebarClassName:"Sidebar"},s&&!g&&r.a.createElement("div",{className:"App-mask",onClick:function(){return m(!1)}}),o,!s&&!g&&r.a.createElement(d,{type:"open",onClick:function(){return m(!0)}}))}),C=n(5),S=n(3),w=n.n(S),N=n(13),_=(n(32),S.GeoJSON.extend({options:{style:{color:"#333",weight:1},interval:20},initialize:function(e){w.a.Util.setOptions(this,e),this._layers={},this.options.sphere?this.addData(this._getFrame()):this.addData(this._getGraticule())},_getFrame:function(){return{type:"Polygon",coordinates:[this._getMeridian(-180).concat(this._getMeridian(180).reverse())]}},_getGraticule:function(){for(var e=[],t=this.options.interval,n=0;n<=180;n+=t)e.push(this._getFeature(this._getMeridian(n),{name:n?n.toString()+"\xb0 E":"Prime meridian"})),0!==n&&e.push(this._getFeature(this._getMeridian(-n),{name:n.toString()+"\xb0 W"}));for(var a=0;a<=90;a+=t)e.push(this._getFeature(this._getParallel(a),{name:a?a.toString()+"\xb0 N":"Equator"})),0!==a&&e.push(this._getFeature(this._getParallel(-a),{name:a.toString()+"\xb0 S"}));return{type:"FeatureCollection",features:e}},_getMeridian:function(e){e=this._lngFix(e);for(var t=[],n=-90;n<=90;n++)t.push([e,n]);return t},_getParallel:function(e){for(var t=[],n=-180;n<=180;n++)t.push([this._lngFix(n),e]);return t},_getFeature:function(e,t){return{type:"Feature",geometry:{type:"LineString",coordinates:e},properties:t}},_lngFix:function(e){return e>=180?179.999999:e<=-180?-179.999999:e}})),x=n(14),M=n.n(x),L=n(15),F=n.n(L),I=function(e){var t=e.type,n=e.coordinates,a=n;if("MultiPolygon"===t){var r=n.map((function(e){return M()({type:"Polygon",coordinates:e})}));a=n[r.indexOf(Math.max.apply(null,r))]}return F()(a,.1)},A=(n(35),[[-40,-100],[50,165]]),P=function(e){var t=e.category,n=e.data,c=e.focus,o=e.selected,l=e.onClick,u=Object(a.useState)(),s=Object(i.a)(u,2),f=s[0],d=s[1],m=Object(a.useState)(),p=Object(i.a)(m,2),h=p[0],g=p[1],v=Object(a.useRef)(),y=Object(a.useMemo)((function(){return b.find((function(e){return e.id===t})).legend}),[t]),O=Object(a.useCallback)((function(e){var t=e.latlng,a=function(e,t,n,a){var r=e.properties,c=r.CODE,o=r.NAME,i=t.countries[c],l="<h2>".concat(o,"</h2>");if(i){var u=n&&n[c],s=a.map((function(e){return Object(C.a)({},e,{year:t.years.find((function(t){return i[t]&&i[t].includes(e.code)}))})})).filter((function(e){return e.year}));if(u){var f=s.map((function(e){return e.code})).find((function(e){return!!u[e]}));if(f){var d=u[f],m=d.title,p=d.body,h=d.imageurl,g=d.imagelink,b=d.youtubeid,v=d.readmorelink;l+="<h3>".concat(m,"</h3>").concat(p),b?l+='<div class="aspect-ratio"><iframe src="https://www.youtube.com/embed/'.concat(b,'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>'):h&&(l+="".concat(h?"".concat(g?'<a href="'.concat(g,'" target="_blank">'):"",'<img src="').concat(h,'" />').concat(g?"</a>":""):"")),v&&(l+='<p><a href="'.concat(v,'" target="_blank">Learn more</a></p>'))}}else l+=s.map((function(e){var t=e.name,n=e.year;return"".concat(t.includes("National")?c.includes("-")?"State":"National":t,": ").concat(n)})).join("<br/>")}return l}(e.layer.feature,n,c,y),r=v.current,o=r.clientWidth,i=o<400?o-100:300,u=r.clientHeight-100;Object(S.popup)({maxWidth:i,maxHeight:u}).setLatLng(t).setContent(a).openOn(f),l()}),[f,v,y,n,c,l]),E=Object(a.useCallback)((function(){return document.body.classList.add("popupopen")}),[]),j=Object(a.useCallback)((function(){return document.body.classList.remove("popupopen")}),[]);return Object(a.useEffect)((function(){d(Object(S.map)(v.current,{crs:new N.CRS("ESRI:53009","+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs",{resolutions:[5e4,4e4,3e4,2e4,1e4,5e3,2500,1250]}),maxZoom:7}).fitBounds(A))}),[v]),Object(a.useEffect)((function(){f&&(new _({sphere:!0,style:{opacity:0,fillColor:"#edf7ff",fillOpacity:1,clickable:!1}}).addTo(f),fetch("./countries_indian_states.json").then((function(e){return e.json()})).then((function(e){g(Object(S.geoJSON)(e,{color:"#555",weight:1,fillColor:"#fff",fillOpacity:.75}).addTo(f)),f.invalidateSize()})).catch((function(e){return console.log(e)})))}),[f,g]),Object(a.useEffect)((function(){if(h&&y&&n){var e=n.countries,t=n.lastYear;h.eachLayer((function(e){return e.setStyle({fillColor:"#fff"})})),h.eachLayer((function(n){var a=n.feature.properties.CODE;if(a&&e[a]&&e[a][t]){var r=e[a],c=r[t];n.feature.properties.NAME=r.name,"IN"===a&&(y.some((function(e){var t=e.code;return c.includes(t)}))?n.bringToFront():n.bringToBack()),y.forEach((function(e){var t=e.code,a=e.color;-1!==c.indexOf(t)&&n.setStyle({fillColor:a})}))}}))}}),[h,y,n]),Object(a.useEffect)((function(){return h&&h.on("click",O),function(){h&&h.off("click",O)}}),[h,n,c,O]),Object(a.useEffect)((function(){if(f&&h&&y&&c){var e,t=h.getLayers().filter((function(e){var t=e.feature.properties.CODE;return c[t]&&y.some((function(e){return c[t][e.code]}))})).map((function(e){var t=e.feature;return Object(C.a)({},t,{geometry:{type:"Point",coordinates:I(t.geometry)}})}));if(t.length){var n={icon:Object(S.icon)({iconUrl:"icon-info-48.png",iconSize:[20,20]})};return e=Object(S.geoJSON)(t,{pointToLayer:function(e,t){return Object(S.marker)(t,n)}}).on("click",O),f.addLayer(e),function(){e&&(e.off("click",O),f.removeLayer(e))}}}}),[f,h,y,c,n,O]),Object(a.useEffect)((function(){if(o&&h){var e=h.getLayers().find((function(e){return e.feature.properties.NAME===o}));e&&O({layer:e,latlng:I(e.feature.geometry).reverse()})}}),[o,h,O]),Object(a.useEffect)((function(){return f&&(f.on("popupopen",E),f.on("popupclose",j)),function(){f&&(f.off("popupopen",E),f.off("popupclose",j))}}),[f,E,j]),r.a.createElement("div",{ref:v,className:"Map"})},D=n(16),T=(n(36),function(e){var t=e.category,n=e.data,c=e.show,o=Object(a.useState)(),l=Object(i.a)(o,2),u=l[0],s=l[1],f=Object(a.useRef)();return Object(a.useEffect)((function(){s(Object(D.chart)("chart",{chart:{type:"area",marginTop:4},title:{text:null},xAxis:{tickmarkPlacement:"on",title:{enabled:!1}},yAxis:{title:{text:"Countries using DHIS2"}},tooltip:{split:!0},plotOptions:{area:{stacking:"normal",lineColor:"#666666",lineWidth:1,marker:{lineWidth:1,lineColor:"#666666"}}},series:[],legend:{enabled:!1}}))}),[f]),Object(a.useEffect)((function(){if(n){var e=u.series,a=u.xAxis,r=u.yAxis,c=b.find((function(e){return e.id===t})),o=c.title,i=c.legend,l=n.years,s=n.year;u.reflow();for(var f=l.slice(l.findIndex((function(e){return i.some((function(t){var n=t.code;return s[e][n]}))})));e.length;)e[0].remove();a[0].setCategories(f),r[0].setTitle({text:"".concat(o," implementations")}),i.slice().reverse().forEach((function(e){var t=e.code,n=e.name,a=e.color;return u.addSeries({name:n,data:f.map((function(e){return s[e][t]})),color:a})}))}}),[u,t,n]),Object(a.useEffect)((function(){u&&c&&u.reflow()}),[u,c]),r.a.createElement("div",{id:"chart",ref:f,className:"Chart Chart-".concat(c?"show":"hide")})}),H=(n(37),function(e){var t=e.category,n=e.data,c=e.show,o=e.focus,l=e.onClick,u=Object(a.useRef)(),s=Object(a.useState)(null),f=Object(i.a)(s,2),d=f[0],m=f[1],p=Object(a.useMemo)((function(){return b.find((function(e){return e.id===t})).legend}),[t]),h=Object(a.useMemo)((function(){if(p&&n){var e=n.countries,t=n.lastYear;return m(null),p.map((function(n){var a=n.code;return{name:n.name,color:n.color,items:Object.values(e).filter((function(e){var n=e[t];return n&&-1!==n.indexOf(a)}),[]).map((function(e){return e.name})).sort(),focus:(o?Object.keys(e).filter((function(e){return o[e]&&o[e][a]})):[]).map((function(t){return e[t].name}))}}))}}),[p,n,o]),g=Object(a.useCallback)((function(){if(h&&u.current){var e=u.current.clientHeight,t=Math.floor((e-70-20)/20),n=h.map((function(e){var n=e.items;return Math.ceil(n.length/t)}));m(n)}}),[u,h]);return Object(a.useEffect)((function(){return c&&(window.addEventListener("resize",g),g()),function(){return window.removeEventListener("resize",g)}}),[c,g]),r.a.createElement("div",{id:"list",ref:u,className:"List List-".concat(c?"show":"hide")},r.a.createElement("div",{className:"container"},d&&h&&h.map((function(e,t){var n=e.name,a=e.color,c=e.items,o=e.focus,i=d[t];return r.a.createElement("div",{key:n,className:"section",style:{flexGrow:i,flexShrink:i}},r.a.createElement("h2",null,r.a.createElement("span",{style:{backgroundColor:a}}),n,": ",c.length),r.a.createElement("ul",{style:{columnCount:i}},c.map((function(e){return r.a.createElement("li",{key:e,onClick:function(){return l(e)}},e,o.includes(e)?r.a.createElement("img",{src:"icon-info-48.png",alt:"More information"}):"")}))))}))))}),J=(n(38),function(e){var t=e.category,n=e.data,c=e.focus,o=e.onClick,l=Object(a.useState)(!0),u=Object(i.a)(l,2),s=u[0],f=u[1],d=b.find((function(e){return e.id===t})).hasChart;return r.a.createElement("div",{className:"ChartList"},r.a.createElement("div",{className:"menu"},d&&r.a.createElement("div",{className:"toggle",onClick:function(){return f(!s)}},s?"View list of implementations":"View chart of adoption over time")),r.a.createElement("div",{className:"wrapper",style:{top:d?30:5}},r.a.createElement(T,{category:t,data:n,show:d&&s}),r.a.createElement(H,{category:t,data:n,show:!s||!d,focus:c,onClick:o})))}),W=(n(39),function(){var e=Object(a.useState)(function(){var e=window.location.hash;if(e){var t=e.substr(1);if(b.find((function(e){return e.id===t})))return t}return"health"}()),t=Object(i.a)(e,2),n=t[0],c=t[1],o=Object(a.useState)(),l=Object(i.a)(o,2),u=l[0],f=l[1],d=Object(a.useState)(),m=Object(i.a)(d,2),p=m[0],h=m[1],g=Object(a.useState)(),v=Object(i.a)(g,2),j=v[0],C=v[1];return Object(a.useEffect)((function(){E(1).then(y).then(f)}),[]),Object(a.useEffect)((function(){u&&E(2).then(O).then(h)}),[u]),Object(a.useEffect)((function(){window.location.hash="#".concat(n),C()}),[n]),r.a.createElement(s,null,r.a.createElement(k,{category:n,data:u,onSelect:c},r.a.createElement(P,{category:n,data:u,focus:p,selected:j,onClick:C}),r.a.createElement(J,{category:n,data:u,focus:p,onClick:C})))});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(W,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}],[[17,1,2]]]);
//# sourceMappingURL=main.936d583b.chunk.js.map