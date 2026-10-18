var e=.8;function t(t,n){let r=t.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!r)return;let i=(e,t)=>{let n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n},a=r.createProgram();if(r.attachShader(a,i(r.VERTEX_SHADER,`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`)),r.attachShader(a,i(r.FRAGMENT_SHADER,`
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uRibs;
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
  vec3 c = fluted(uv, p, uTime);
  float fade = smoothstep(.2, .95, 1.-uv.y);
  vec3 col = mix(c, vec3(1.), fade);
  // A little dither, so the last 8-bit steps into white do not line up as a
  // visible contour across the page. It dies out just before pure white.
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)))*43758.5453)-.5;
  col += n*1.5/255.*min(1., (1.-fade)*40.);
  gl_FragColor = vec4(col, 1.);
}`)),r.linkProgram(a),!r.getProgramParameter(a,r.LINK_STATUS))return;r.useProgram(a),r.bindBuffer(r.ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let o=r.getAttribLocation(a,`p`);r.enableVertexAttribArray(o),r.vertexAttribPointer(o,2,r.FLOAT,!1,0,0);let s=e=>r.getUniformLocation(a,e);t.dataset.colors.split(`,`).forEach((e,t)=>{let n=parseInt(e.slice(1),16);r.uniform3f(s(`uC${t}`),(n>>16)/255,(n>>8&255)/255,(n&255)/255)});let c=s(`uRes`),l=s(`uTime`),u=s(`uRibs`),d=()=>{let n=Math.max(1,Math.round(t.clientWidth*e)),i=Math.max(1,Math.round(t.clientHeight*e));(t.width!==n||t.height!==i)&&(t.width=n,t.height=i,r.viewport(0,0,n,i)),r.uniform2f(c,n,i),r.uniform1f(u,t.clientWidth/46)},f=e=>{r.uniform1f(l,20+n*13+e/1e3*.12),r.drawArrays(r.TRIANGLES,0,3)},p=matchMedia(`(prefers-reduced-motion: reduce)`).matches,m=!0,h=0,g=e=>{f(e),h=requestAnimationFrame(g)},_=()=>{cancelAnimationFrame(h),!p&&m&&!document.hidden&&(h=requestAnimationFrame(g))};new ResizeObserver(()=>{d(),f(performance.now())}).observe(t),new IntersectionObserver(([e])=>{m=e.isIntersecting,_()}).observe(t),document.addEventListener(`visibilitychange`,_),d(),f(performance.now()),_()}document.querySelectorAll(`canvas[data-sky]`).forEach(t);