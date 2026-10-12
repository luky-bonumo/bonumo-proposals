var e={mesh:0,flow:1,fluted:2},t={mesh:.14,flow:.17,fluted:.12},n={mesh:.5,flow:.5,fluted:.8},r=46;function i(i){let a=i.dataset.sky,o=i.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!o)return;let s=(e,t)=>{let n=o.createShader(e);return o.shaderSource(n,t),o.compileShader(n),n},c=o.createProgram();if(o.attachShader(c,s(o.VERTEX_SHADER,`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`)),o.attachShader(c,s(o.FRAGMENT_SHADER,`
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uRibs;
uniform int uMode;
uniform vec3 uC0, uC1, uC2, uC3, uC4;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// Colour spots on a plane that is warped twice, so they swirl into each other.
vec3 mesh(vec2 p, float t){
  vec2 q = p + .5*vec2(snoise(vec3(p*.7, t*.6)), snoise(vec3(p*.7+11.3, t*.6)));
  q += .28*vec2(snoise(vec3(q*1.3+4.1, t*.9)), snoise(vec3(q*1.3+17.9, t*.9)));
  vec3 c = uC0;
  c = mix(c, uC1, smoothstep(-.35, .55, snoise(vec3(q*.75+1.7, t*.8))));
  c = mix(c, uC2, smoothstep(-.2, .7, snoise(vec3(q*.9+5.2, t*.7+3.))));
  c = mix(c, uC3, smoothstep(0., .8, snoise(vec3(q*1.1+9.4, t+7.))));
  c = mix(c, uC4, smoothstep(.15, .9, snoise(vec3(q*.6+13.6, t*.5+11.))));
  return c;
}

// Long ribbons of colour travelling across the page at an angle.
vec3 flow(vec2 p, float t){
  float a = -.42;
  vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
  r.y += .26*snoise(vec3(r.x*.55-t*.5, r.y*.4, t*.35));
  vec3 c = uC0;
  c = mix(c, uC1, smoothstep(-.3, .5, snoise(vec3(r.x*.35-t*.55, r.y*1.9, t*.3))));
  c = mix(c, uC2, smoothstep(-.1, .6, snoise(vec3(r.x*.3-t*.4+5., r.y*2.4+3., t*.4))));
  c = mix(c, uC3, smoothstep(0., .7, snoise(vec3(r.x*.4-t*.7+9., r.y*1.6+7., t*.25))));
  c = mix(c, uC4, smoothstep(.2, .9, snoise(vec3(r.x*.25-t*.3+13., r.y*3.+11., t*.5))));
  return c;
}

// The mesh seen through ribbed glass: every rib bends the view sideways.
vec3 fluted(vec2 uv, vec2 p, float t){
  float fx = fract(uv.x*uRibs)-.5;
  vec2 d = p;
  d.x += fx*.5;
  d.y += fx*fx*.2;
  vec3 c = mesh(d*.85, t);
  c *= 1.-.06*smoothstep(.34, .5, abs(fx));
  c += .045*smoothstep(.16, 0., abs(fx+.22));
  return c;
}

void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec2 p = (uv-.5)*vec2(uRes.x/uRes.y, 1.)*1.7;
  vec3 c = uMode == 0 ? mesh(p, uTime) : uMode == 1 ? flow(p, uTime) : fluted(uv, p, uTime);
  float fade = smoothstep(.2, .95, 1.-uv.y);
  gl_FragColor = vec4(mix(c, vec3(1.), fade), 1.);
}`)),o.linkProgram(c),!o.getProgramParameter(c,o.LINK_STATUS))return;o.useProgram(c),o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let l=o.getAttribLocation(c,`p`);o.enableVertexAttribArray(l),o.vertexAttribPointer(l,2,o.FLOAT,!1,0,0);let u=e=>o.getUniformLocation(c,e);o.uniform1i(u(`uMode`),e[a]),i.dataset.colors.split(`,`).forEach((e,t)=>{let n=parseInt(e.slice(1),16);o.uniform3f(u(`uC${t}`),(n>>16)/255,(n>>8&255)/255,(n&255)/255)});let d=u(`uRes`),f=u(`uTime`),p=u(`uRibs`),m=()=>{let e=Math.max(1,Math.round(i.clientWidth*n[a])),t=Math.max(1,Math.round(i.clientHeight*n[a]));(i.width!==e||i.height!==t)&&(i.width=e,i.height=t,o.viewport(0,0,e,t)),o.uniform2f(d,e,t),o.uniform1f(p,i.clientWidth/r)},h=e=>{o.uniform1f(f,20+e/1e3*t[a]),o.drawArrays(o.TRIANGLES,0,3)},g=matchMedia(`(prefers-reduced-motion: reduce)`).matches,_=!0,v=0,y=e=>{h(e),v=requestAnimationFrame(y)},b=()=>{cancelAnimationFrame(v),!g&&_&&!document.hidden&&(v=requestAnimationFrame(y))};new ResizeObserver(()=>{m(),h(performance.now())}).observe(i),new IntersectionObserver(([e])=>{_=e.isIntersecting,b()}).observe(i),document.addEventListener(`visibilitychange`,b),m(),h(performance.now()),b()}document.querySelectorAll(`canvas[data-sky]`).forEach(i);