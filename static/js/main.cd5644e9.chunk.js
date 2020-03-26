(this["webpackJsonpdhis2-in-action"]=this["webpackJsonpdhis2-in-action"]||[]).push([[0],[,,,,,,,,,function(e,t,n){e.exports=n(23)},,,,,function(e,t,n){},function(e,t,n){},function(e,t,n){},function(e,t,n){},,function(e,t,n){},function(e,t,n){},function(e,t,n){},,function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=n(4),o=n.n(i),c=(n(14),n(1)),s=(n(15),function(e){var t=e.items,n=e.data,i=Object(a.useMemo)((function(){return n?n.year[n.lastYear]:{}}),[n]);return r.a.createElement("div",{className:"Legend"},t.map((function(e){var t=e.code,n=e.name,a=e.color;return r.a.createElement("div",{key:t},r.a.createElement("span",{style:{backgroundColor:a}})," ",n," (",i[t],")")})))}),l=(n(16),function(e){var t=e.id,n=e.title,a=e.legend,i=e.selected,o=e.data,c=e.onClick;return r.a.createElement("div",{onClick:function(){return c(t)},className:"Category".concat(i?" Category-selected":"")},r.a.createElement("h2",null,n),i&&r.a.createElement(s,{items:a,data:o}))}),u=n(5),d=n.n(u),f=[{id:"health",title:"Health Information System",legend:[{code:"s",name:"National",color:"#238443"},{code:"i",name:"Indian State",color:"#78c679"},{code:"p",name:"Pilot",color:"#d9f0a3"}],showChart:!0},{id:"covid-19",title:"COVID-19",legend:[{code:"c",name:"Operational",color:"#d95f0e"},{code:"v",name:"In development",color:"#fec44f"}],showChart:!1},{id:"tracker",title:"Tracker",legend:[{code:"t",name:"Tracker",color:"#e34a33"}],showChart:!0},{id:"android",title:"Android app",legend:[{code:"a",name:"Android app",color:"#2ca25f"}],showChart:!0},{id:"emis",title:"Education Management Information System (EMIS)",legend:[{code:"e",name:"DHIS2 for Education",color:"#1d91c0"}],showChart:!1}],h=function(e){var t=e.feed.entry,n=t[0],a=[];for(var r in n)n.hasOwnProperty(r)&&"gsx$y"===r.slice(0,5)&&a.push(r.slice(-4));var i=a[a.length-1],o={},c={};return t.forEach((function(e){var t=e.gsx$code.$t,n=e.gsx$name.$t,r=o[t]={name:n};a.forEach((function(n){var a=e["gsx$y"+n].$t;t.startsWith("IN-")&&(a=a.replace("s","").replace("p","")),a.length&&(r[n]=a,c[n]||(c[n]={p:0,s:0,i:0,t:0,a:0,e:0,c:0,v:0}),a.split("").forEach((function(e){c[n][e]++})))}))})),{countries:o,year:c,years:a,lastYear:i}},m=(n(17),function(e){var t=e.category,n=e.data,a=e.onChange;return r.a.createElement("div",{className:"Sidebar"},r.a.createElement("div",{className:"Sidebar-header"},r.a.createElement("h1",null,"DHIS2 in action"),r.a.createElement("p",null,"DHIS2 is in use all over the world. Check out different use cases with this interactive map.")),f.map((function(e){return r.a.createElement(l,Object.assign({key:e.id,onClick:a,selected:t===e.id,data:n},e))})))}),g=n(8),p=n(2),v=n.n(p),y=n(6),b=(n(18),p.GeoJSON.extend({options:{style:{color:"#333",weight:1},interval:20},initialize:function(e){v.a.Util.setOptions(this,e),this._layers={},this.options.sphere?this.addData(this._getFrame()):this.addData(this._getGraticule())},_getFrame:function(){return{type:"Polygon",coordinates:[this._getMeridian(-180).concat(this._getMeridian(180).reverse())]}},_getGraticule:function(){for(var e=[],t=this.options.interval,n=0;n<=180;n+=t)e.push(this._getFeature(this._getMeridian(n),{name:n?n.toString()+"\xb0 E":"Prime meridian"})),0!==n&&e.push(this._getFeature(this._getMeridian(-n),{name:n.toString()+"\xb0 W"}));for(var a=0;a<=90;a+=t)e.push(this._getFeature(this._getParallel(a),{name:a?a.toString()+"\xb0 N":"Equator"})),0!==a&&e.push(this._getFeature(this._getParallel(-a),{name:a.toString()+"\xb0 S"}));return{type:"FeatureCollection",features:e}},_getMeridian:function(e){e=this._lngFix(e);for(var t=[],n=-90;n<=90;n++)t.push([e,n]);return t},_getParallel:function(e){for(var t=[],n=-180;n<=180;n++)t.push([this._lngFix(n),e]);return t},_getFeature:function(e,t){return{type:"Feature",geometry:{type:"LineString",coordinates:e},properties:t}},_lngFix:function(e){return e>=180?179.999999:e<=-180?-179.999999:e}})),E=(n(19),[[-40,-90],[50,165]]),O=function(e){var t=e.category,n=e.data,i=e.height,o=Object(a.useState)(),s=Object(c.a)(o,2),l=s[0],u=s[1],d=Object(a.useState)(),h=Object(c.a)(d,2),m=h[0],v=h[1],O=Object(a.useRef)();return Object(a.useEffect)((function(){u(Object(p.map)(O.current,{crs:new y.CRS("ESRI:53009","+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs",{resolutions:[5e4,4e4,3e4,2e4,1e4,5e3,2500,1250]}),maxZoom:7}).fitBounds(E))}),[O]),Object(a.useEffect)((function(){l&&(l.invalidateSize(),l.fitBounds(E))}),[l,i]),Object(a.useEffect)((function(){l&&(new b({sphere:!0,style:{opacity:0,fillColor:"#edf7ff",fillOpacity:1,clickable:!1}}).addTo(l),fetch("./countries_indian_states.json").then((function(e){return e.json()})).then((function(e){return v(Object(p.geoJSON)(e,{color:"#555",weight:1,fillColor:"#fff",fillOpacity:.75}).addTo(l))})).catch((function(e){return console.log(e)})))}),[l,v]),Object(a.useEffect)((function(){if(m&&t&&n){var e=n.countries,a=n.lastYear,r=f.find((function(e){return e.id===t})).legend;m.eachLayer((function(e){return e.setStyle({fillColor:"#fff"})})),m.eachLayer((function(t){var n=t.feature.properties.CODE;if(n&&e[n]&&e[n][a]){var i=e[n][a];"IN"===n&&(r.some((function(e){var t=e.code;return i.includes(t)}))?t.bringToFront():t.bringToBack()),r.forEach((function(e){var n=e.code,a=e.color;-1!==i.indexOf(n)&&t.setStyle({fillColor:a})}))}})),m.bindPopup((function(e){var t=e.feature.properties,a=t.CODE,i=t.NAME,o=n.countries[a],c="<h2>".concat(i,"</h2>");if(!o)return c;var s=r.map((function(e){return Object(g.a)({},e,{year:n.years.find((function(t){return o[t]&&o[t].includes(e.code)}))})})).filter((function(e){return e.year})).map((function(e){var t=e.name,n=e.year;return"".concat(t.includes("National")?a.includes("-")?"State":"National":t,": ").concat(n)}));return"".concat(c).concat(s.join("<br/>"))}))}}),[m,t,n]),r.a.createElement("div",{ref:O,className:"Map",style:{height:i}})},j=n(7),C=(n(20),function(e){var t=e.category,n=e.data,i=e.show,o=Object(a.useState)(),s=Object(c.a)(o,2),l=s[0],u=s[1],d=Object(a.useRef)();return Object(a.useEffect)((function(){u(Object(j.chart)("chart",{chart:{type:"area"},title:{text:null},xAxis:{tickmarkPlacement:"on",title:{enabled:!1}},yAxis:{title:{text:"Countries using DHIS2"}},tooltip:{split:!0},plotOptions:{area:{stacking:"normal",lineColor:"#666666",lineWidth:1,marker:{lineWidth:1,lineColor:"#666666"}}},series:[],legend:{enabled:!1}}))}),[d]),Object(a.useEffect)((function(){if(n){for(var e=l.series,a=l.xAxis,r=l.yAxis,i=f.find((function(e){return e.id===t})),o=i.title,c=i.legend,s=n.years,u=n.year,d=s.slice(s.findIndex((function(e){return c.some((function(t){var n=t.code;return u[e][n]}))})));e.length;)e[0].remove();a[0].setCategories(d),r[0].setTitle({text:"".concat(o," implementations")}),c.slice().reverse().forEach((function(e){var t=e.code,n=e.name,a=e.color;return l.addSeries({name:n,data:d.map((function(e){return u[e][t]})),color:a})}))}}),[l,t,n]),r.a.createElement("div",{id:"chart",ref:d,className:"Chart Chart-".concat(i?"show":"hide")})}),S=(n(21),function(){var e=Object(a.useState)(function(){var e=window.location.hash;if(e){var t=e.substr(1);if(f.find((function(e){return e.id===t})))return t}return"health"}()),t=Object(c.a)(e,2),n=t[0],i=t[1],o=Object(a.useState)(),s=Object(c.a)(o,2),l=s[0],u=s[1],g=f.find((function(e){return e.id===n})).showChart;return Object(a.useEffect)((function(){d()("//spreadsheets.google.com/feeds/list/1Fd-vBoJPjp5wdCyJc7d_LOJPOg5uqdzVa3Eq5-VFR-g/1/public/values?alt=json-in-script",{jsonpCallback:"callback"}).then((function(e){return e.json()})).then(h).then(u)}),[]),Object(a.useEffect)((function(){window.location.hash="#".concat(n)}),[n]),r.a.createElement("div",{className:"App"},r.a.createElement(m,{category:n,data:l,onChange:i}),r.a.createElement("div",{className:"App-main"},r.a.createElement(O,{category:n,data:l,height:g?"58%":"100%"}),r.a.createElement(C,{category:n,data:l,show:g})))});Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(S,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}],[[9,1,2]]]);
//# sourceMappingURL=main.cd5644e9.chunk.js.map