export const planetVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPos.xyz;
  gl_Position = projectionMatrix * mvPos;
}
`;

export const planetFragmentShader = `
precision highp float;

uniform float uTime;
uniform int uType;
uniform vec3 uCol1;
uniform vec3 uCol2;
uniform vec3 uCol3;
uniform float uRoughness;
uniform float uMetalness;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float hash11(float p){return fract(sin(p)*43758.5);}

float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),u.x),
             mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),u.x),u.y);
}

float fbm(vec2 p){
  float v=0.0,a=0.5;mat2 r=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<8;i++){v+=a*vnoise(p);p=r*p;a*=0.5;}
  return v;
}
float fbm5(vec2 p){
  float v=0.0,a=0.5;mat2 r=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*vnoise(p);p=r*p;a*=0.5;}
  return v;
}
float fbm3(vec2 p){
  float v=0.0,a=0.5;mat2 r=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<3;i++){v+=a*vnoise(p);p=r*p;a*=0.5;}
  return v;
}
float wfbm(vec2 p,float t){
  vec2 q=vec2(fbm3(p+t*0.03),fbm3(p+vec2(5.2,1.3)+t*0.02));
  return fbm5(p+4.0*q);
}

vec3 pbr(vec3 alb,float rough,float metal,vec3 N,vec3 V,vec3 L){
  vec3 H=normalize(L+V);
  float NdL=max(dot(N,L),0.0),NdV=max(dot(N,V),0.001),NdH=max(dot(N,H),0.0);
  float a=rough*rough,a2=a*a;
  float denom=NdH*NdH*(a2-1.0)+1.0;
  float D=a2/(3.14159*denom*denom+0.0001);
  float k=a*0.5;
  float G=NdV/(NdV*(1.0-k)+k)*NdL/(NdL*(1.0-k)+k);
  vec3 F0=mix(vec3(0.04),alb,metal);
  vec3 F=F0+(1.0-F0)*pow(clamp(1.0-max(dot(H,V),0.0),0.0,1.0),5.0);
  vec3 spec=D*G*F/(4.0*NdV*NdL+0.001);
  return ((1.0-F)*(1.0-metal)*alb/3.14159+spec)*NdL;
}

void main(){
  vec3 N=normalize(vNormal);
  vec3 V=normalize(vViewPosition);
  vec3 L=normalize(-vWorldPosition);
  float NdV=max(dot(N,V),0.001);
  float rough=uRoughness,metal=uMetalness;
  vec3 albedo=uCol1;

  if(uType==0){
    vec2 uv=vUv*6.0;
    float base=wfbm(uv,0.0);
    float detail=fbm(uv*3.0+1.7);
    float micro=fbm(uv*8.0+3.3);
    float highlands=smoothstep(0.42,0.58,base);
    albedo=mix(uCol2*0.75,mix(uCol1,uCol3,detail*0.5),highlands);
    for(int i=0;i<3;i++){
      float sc=14.0+float(i)*9.0;
      float cx=fbm3(uv*sc+float(i)*7.3),cy=fbm3(uv*sc+float(i)*3.1+2.0);
      float cr=smoothstep(0.76,0.72,cx)*smoothstep(0.72,0.76,cy);
      float fl=smoothstep(0.68,0.64,cx)*smoothstep(0.64,0.68,cy);
      albedo=mix(albedo,uCol3*1.1,cr*0.55);
      albedo=mix(albedo,uCol2*0.5,fl*0.4);
    }
    float rays=smoothstep(0.88,0.95,fbm(uv*22.0+5.0));
    albedo=mix(albedo,uCol3*1.2,rays*0.25);
    albedo+=(micro-0.5)*0.04;
    rough=mix(0.88,0.96,detail);
  }
  else if(uType==1){
    vec2 uv1=vUv*2.5+vec2(uTime*0.006,uTime*0.004);
    vec2 uv2=vUv*4.0-vec2(uTime*0.009,uTime*0.003);
    float n1=wfbm(uv1,uTime),n2=wfbm(uv2+n1*0.8,uTime*0.7);
    float n3=fbm5(vUv*8.0+vec2(uTime*0.004,0.0));
    float lat=abs(vUv.y-0.5)*2.0;
    float polar=smoothstep(0.75,1.0,lat);
    float vortex=fbm(vec2(vUv.x*3.0+uTime*0.02,lat*4.0))*polar;
    float vShape=sin((vUv.y-0.5)*8.0+n1*2.0)*0.5+0.5;
    albedo=mix(uCol2*0.9,uCol1,n1*0.7+n2*0.3);
    albedo=mix(albedo,uCol3,smoothstep(0.62,0.8,n3)*0.4);
    albedo=mix(albedo,uCol3*1.15,vShape*0.2);
    albedo=mix(albedo,uCol2*0.7,vortex*0.35);
    float uvBand=sin(vUv.y*18.0+n1*3.0+uTime*0.01)*0.5+0.5;
    albedo*=(0.88+uvBand*0.18);
    rough=0.22;
  }
  else if(uType==2){
    vec2 uv=vUv*3.5;
    float continent=wfbm(uv+0.5,0.0);
    float landMask=smoothstep(0.42,0.56,continent);
    float shallows=smoothstep(0.36,0.45,continent);
    float lat=abs(vUv.y-0.5)*2.0;
    float elevation=fbm(uv*2.0+1.3);
    float desert=fbm5(uv*4.0+3.7);
    float jungle=fbm5(uv*5.0+7.1);
    float mountainSnow=smoothstep(0.72,0.92,elevation)*landMask;
    vec3 deepSea=vec3(0.03,0.08,0.25),midSea=vec3(0.05,0.14,0.38),shallowSea=vec3(0.08,0.24,0.52);
    vec3 oceanColor=mix(deepSea,mix(midSea,shallowSea,shallows),shallows);
    vec3 grassland=vec3(0.14,0.26,0.08),forest=vec3(0.07,0.18,0.05);
    vec3 desertCol=vec3(0.52,0.38,0.18),rock=vec3(0.32,0.28,0.22),snowCol=vec3(0.88,0.90,0.92);
    vec3 landColor=mix(grassland,forest,smoothstep(0.4,0.7,jungle));
    landColor=mix(landColor,desertCol,smoothstep(0.55,0.8,desert)*smoothstep(0.3,0.5,1.0-lat));
    landColor=mix(landColor,rock,smoothstep(0.65,0.85,elevation));
    landColor=mix(landColor,snowCol,mountainSnow);
    float iceCap=smoothstep(0.74,0.96,lat);
    float iceDetail=fbm(vUv*12.0+vec2(0.0,uTime*0.001));
    float ice=mix(iceCap,iceCap*smoothstep(0.3,0.9,iceDetail),0.4);
    albedo=mix(oceanColor,landColor,landMask);
    albedo=mix(albedo,snowCol,ice);
    vec2 cloudUV=vUv*4.5+vec2(uTime*0.007,uTime*0.002);
    float cloud=wfbm(cloudUV,uTime*0.5);
    float cloud2=fbm5(vUv*7.0-vec2(uTime*0.005,uTime*0.003));
    float cloudMask=smoothstep(0.5,0.72,cloud)*smoothstep(0.45,0.65,cloud2);
    albedo*=(1.0-smoothstep(0.4,0.7,cloud)*0.12);
    albedo=mix(albedo,vec3(0.91,0.93,0.95),cloudMask*0.85);
    rough=mix(0.04,0.92,landMask*(1.0-cloudMask));
    rough=mix(rough,0.1,cloudMask);
    rough=mix(rough,0.08,ice);
  }
  else if(uType==3){
    vec2 uv=vUv*4.0;
    float base=wfbm(uv+1.7,0.0);
    float dust=fbm(uv*5.0+2.3);
    float fine=fbm(uv*12.0+4.1);
    float lat=abs(vUv.y-0.5)*2.0;
    float hemispheres=smoothstep(0.42,0.58,vUv.y);
    albedo=mix(mix(uCol1*1.05,uCol1*0.85,dust*0.5),mix(uCol2*0.9,uCol2*0.7,base*0.4),hemispheres*0.5);
    float dustStorm=fbm5(uv*2.0+vec2(uTime*0.008,0.0));
    albedo=mix(albedo,uCol3*1.15,smoothstep(0.55,0.75,dustStorm)*0.35);
    for(int i=0;i<4;i++){
      float sc=10.0+float(i)*8.0;
      float cx=fbm3(uv*sc+float(i)*5.1),cy=fbm3(uv*sc+float(i)*2.7+1.0);
      float cr=smoothstep(0.77,0.73,cx)*smoothstep(0.73,0.77,cy);
      float fl=smoothstep(0.69,0.65,cx)*smoothstep(0.65,0.69,cy);
      albedo=mix(albedo,mix(uCol2,uCol3,0.3)*0.6,fl*0.5);
      albedo=mix(albedo,uCol1*1.1,cr*0.4);
    }
    float volcano=smoothstep(0.02,0.0,length(vUv-vec2(0.25,0.52))-0.08);
    albedo=mix(albedo,uCol2*0.55,volcano*0.6);
    float iceCap=smoothstep(0.80,0.97,lat);
    float iceDetail=fbm(vUv*15.0);
    albedo=mix(albedo,vec3(0.82,0.78,0.72),iceCap*smoothstep(0.3,0.8,iceDetail));
    albedo+=(fine-0.5)*0.03;
    rough=mix(0.88,0.97,dust);
  }
  else if(uType==4){
    vec2 uv=vUv;
    float latWarp=fbm3(vec2(uv.x*8.0+uTime*0.006,uv.y*2.0))*0.08;
    float y=uv.y+latWarp;
    float band1=sin(y*20.0+fbm3(uv*vec2(2.0,6.0))*1.8+uTime*0.01)*0.5+0.5;
    float band2=sin(y*36.0+fbm3(uv*vec2(1.5,10.0))*1.2+uTime*0.007)*0.5+0.5;
    float band3=sin(y*52.0+uTime*0.004)*0.5+0.5;
    float turbulence=wfbm(uv*vec2(12.0,4.0)+uTime*0.008,uTime*0.3)*0.5+0.5;
    albedo=mix(uCol2,uCol1,band1);
    albedo=mix(albedo,mix(uCol3,uCol1,band3),band2*0.45);
    albedo=mix(albedo,uCol1*1.05,turbulence*0.15);
    vec2 gc=vec2(0.68,0.425);
    float gAng=atan(uv.y-gc.y,(uv.x-gc.x)*2.5);
    float gDist=length(vec2((uv.x-gc.x)*2.2,uv.y-gc.y));
    float gSp=fbm5(vec2(gAng*2.0,gDist*8.0)+uTime*0.02);
    float grs=smoothstep(0.135,0.0,gDist-0.12*gSp);
    float grsC=smoothstep(0.06,0.0,gDist);
    albedo=mix(albedo,mix(vec3(0.68,0.22,0.08),vec3(0.78,0.35,0.15),gSp),grs*0.9);
    albedo=mix(albedo,vec3(0.72,0.32,0.12)*0.7,grsC*0.5);
    for(int i=0;i<3;i++){
      vec2 oc=vec2(0.2+float(i)*0.28,0.36+float(i)*0.04);
      float od=length((uv-oc)*vec2(2.0,1.0));
      albedo=mix(albedo,vec3(0.92,0.88,0.78),smoothstep(0.045,0.0,od)*0.7);
    }
    rough=0.68;
  }
  else if(uType==5){
    vec2 uv=vUv;
    float lN=fbm3(vec2(uv.x*6.0+uTime*0.005,uv.y*1.5))*0.05;
    float y=uv.y+lN;
    float b1=sin(y*14.0+fbm3(uv*vec2(1.5,8.0))*1.0+uTime*0.007)*0.5+0.5;
    float b2=sin(y*28.0+uTime*0.004)*0.5+0.5;
    float b3=sin(y*6.0)*0.5+0.5;
    float haze=wfbm(uv*vec2(6.0,2.0)+uTime*0.005,uTime*0.2);
    albedo=mix(uCol2,uCol1,b1);
    albedo=mix(albedo,uCol3,b2*0.28);
    albedo=mix(albedo,uCol1*1.08,b3*0.2);
    albedo=mix(albedo,uCol3*0.9,(haze-0.4)*0.15);
    float hLat=vUv.y;
    float hexLat=smoothstep(0.1,0.2,hLat)*smoothstep(0.35,0.25,hLat);
    float hexA=atan(vUv.y-0.22,vUv.x-0.5)*6.0;
    float hex=sin(hexA)*0.06*hexLat;
    albedo=mix(albedo,uCol3*1.15,fbm3(vec2(hexA*0.3,hex+uTime*0.01))*hexLat*0.2);
    rough=0.72;
  }
  else if(uType==6){
    vec2 uv=vUv;
    float tiltedY=uv.x;
    float lN=fbm3(uv*2.0+uTime*0.003)*0.04;
    float b1=sin(tiltedY*12.0+lN+uTime*0.003)*0.5+0.5;
    float b2=sin(tiltedY*24.0+uTime*0.002)*0.5+0.5;
    float haze=wfbm(uv*3.0+uTime*0.002,uTime*0.1);
    float polar=smoothstep(0.6,0.95,abs(uv.y-0.5)*2.0);
    albedo=mix(uCol2,uCol1,b1*0.6+haze*0.4);
    albedo=mix(albedo,uCol3,b2*0.2);
    albedo=mix(albedo,uCol1*1.12,polar*0.3);
    albedo*=(0.9+fbm(uv*6.0+uTime*0.002)*0.2);
    rough=0.38;
  }
  else{
    vec2 uv=vUv;
    float lN=fbm3(vec2(uv.x*5.0,uv.y*1.5)+uTime*0.006)*0.06;
    float y=uv.y+lN;
    float b1=sin(y*16.0+fbm3(uv*vec2(3.0,8.0))*2.0+uTime*0.012)*0.5+0.5;
    float b2=sin(y*30.0+uTime*0.008)*0.5+0.5;
    float storm=wfbm(uv*vec2(6.0,4.0)-uTime*0.018,uTime*0.8);
    albedo=mix(uCol2,uCol1,b1*0.65+storm*0.35);
    albedo=mix(albedo,uCol3,smoothstep(0.55,0.75,storm)*0.4);
    vec2 dc=vec2(0.35,0.44);
    float dA=atan(uv.y-dc.y,(uv.x-dc.x)*2.0),dDist=length(vec2((uv.x-dc.x)*2.0,uv.y-dc.y));
    float dSp=fbm3(vec2(dA,dDist*6.0)-uTime*0.025);
    albedo=mix(albedo,vec3(0.04,0.06,0.22),smoothstep(0.11,0.0,dDist-0.09*dSp)*0.8);
    albedo=mix(albedo,vec3(0.82,0.88,0.98),smoothstep(0.03,0.0,length(uv-vec2(0.52,0.46)))*0.85);
    albedo=mix(albedo,uCol3*1.4,smoothstep(0.72,0.92,fbm5(uv*10.0-uTime*0.015))*0.25);
    rough=0.42;
  }

  vec3 direct=pbr(albedo,rough,metal,N,V,L);
  vec3 ambient=albedo*vec3(0.04,0.055,0.11)*0.7;
  float rim=1.0-NdV;
  vec3 atmRim=(uCol1*0.3+vec3(0.04,0.07,0.18))*pow(rim,2.8)*1.4*(1.0-metal);
  float terminator=smoothstep(-0.14,0.22,dot(N,L));
  float limb=pow(NdV,0.35);
  vec3 color=direct*terminator*limb+ambient+atmRim;
  // ACES filmic
  color=color*(2.51*color+0.03)/(color*(2.43*color+0.59)+0.14);
  color=clamp(color,0.0,1.0);
  color=pow(color,vec3(1.0/2.2));
  gl_FragColor=vec4(color,1.0);
}
`;

export const sunVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const sunFragmentShader = `
precision highp float;
uniform float uTime;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vnoise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5;mat2 r=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<7;i++){v+=a*vnoise(p);p=r*p;a*=0.5;}
  return v;
}
float fbm3(vec2 p){float v=0.0,a=0.5;for(int i=0;i<3;i++){v+=a*vnoise(p);p*=2.1;a*=0.5;}return v;}

void main(){
  vec2 uv=vUv*6.0;float t=uTime;
  vec2 q=vec2(fbm3(uv+t*0.03),fbm3(uv+vec2(5.2,1.3)+t*0.025));
  float n1=fbm(uv+4.0*q+t*0.02);
  float n2=fbm(uv*1.6+vec2(q.y,q.x)*2.0+t*0.015);
  float n3=fbm(uv*0.4-t*0.012);
  float n4=fbm(uv*3.2+vec2(1.7,9.2)+t*0.035);

  vec3 col=mix(vec3(0.45,0.10,0.00),vec3(1.00,0.55,0.04),smoothstep(0.2,0.55,n1));
  col=mix(col,vec3(0.80,0.25,0.01),smoothstep(0.62,0.72,n4)*smoothstep(0.72,0.62,n1)*0.6);
  col=mix(col,vec3(1.00,0.90,0.38),smoothstep(0.68,0.85,n2)*0.6);
  col=mix(col,vec3(1.00,1.00,0.80),smoothstep(0.80,0.96,n3)*smoothstep(0.80,0.96,n1)*0.5);

  // Sunspots
  vec2 ss1=vec2(0.30,0.52),ss2=vec2(0.38,0.48);
  col=mix(col,vec3(0.80,0.25,0.01)*0.6,smoothstep(0.11,0.06,length(vUv-ss1))*0.7);
  col=mix(col,vec3(0.45,0.10,0.00)*0.5,smoothstep(0.06,0.0,length(vUv-ss1))*0.9);
  col=mix(col,vec3(0.80,0.25,0.01)*0.6,smoothstep(0.08,0.04,length(vUv-ss2))*0.7);
  col=mix(col,vec3(0.45,0.10,0.00)*0.5,smoothstep(0.04,0.0,length(vUv-ss2))*0.9);

  vec3 vd=normalize(-vPosition);
  float cosA=max(dot(normalize(vNormal),vd),0.0);
  col*=1.0-0.6*(1.0-sqrt(cosA));
  float rim=1.0-cosA;
  col+=vec3(1.0,0.4,0.0)*pow(rim,3.5)*2.0;
  gl_FragColor=vec4(col,1.0);
}
`;

export const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragmentShader = `
precision highp float;
uniform vec3 uAtmoColor;
uniform float uThickness;

varying vec3 vNormal;
varying vec3 vPosition;

void main(){
  vec3 V=normalize(-vPosition);
  float NdV=max(dot(normalize(vNormal),V),0.0);
  float rim=1.0-NdV;
  float atmo=pow(rim,2.2)*uThickness+pow(rim,4.5)*uThickness*0.4;
  vec3 scatter=uAtmoColor+vec3(0.0,0.05,0.15)*pow(rim,6.0);
  gl_FragColor=vec4(scatter,atmo*0.88);
}
`;

export const starVertexShader = `
attribute float aSize;
attribute float aPhase;
attribute float aTemp;
uniform float uTime;
varying float vTwinkle;
varying float vTemp;

void main(){
  vTemp=aTemp;
  vTwinkle=0.55+0.45*sin(uTime*1.2+aPhase);
  vec4 mvPos=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=aSize*vTwinkle*(700.0/-mvPos.z);
  gl_Position=projectionMatrix*mvPos;
}
`;

export const starFragmentShader = `
precision highp float;
varying float vTwinkle;
varying float vTemp;

void main(){
  float d=length(gl_PointCoord-0.5)*2.0;
  float a=(1.0-smoothstep(0.4,1.0,d))*vTwinkle;
  a+=max(0.0,0.3-d*2.0)*vTwinkle*0.5;
  vec3 cool=vec3(1.0,0.72,0.45),mid=vec3(1.0,0.97,0.90),hot=vec3(0.72,0.82,1.0);
  vec3 col=vTemp<0.5?mix(cool,mid,vTemp*2.0):mix(mid,hot,(vTemp-0.5)*2.0);
  gl_FragColor=vec4(col,a);
}
`;

export const ringVertexShader = `
attribute vec2 uv;
varying vec2 vUv;
varying float vDist;

void main(){
  vUv=uv;
  vDist=length(position.xz);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}
`;

export const ringFragmentShader = `
precision highp float;
uniform vec3 uRingColor;
uniform float uInnerR;
uniform float uOuterR;
uniform float uTime;
varying vec2 vUv;
varying float vDist;

float hash(float p){return fract(sin(p)*43758.5);}
float vnoise1(float p){float i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(hash(i),hash(i+1.0),f);}

void main(){
  float t=(vDist-uInnerR)/(uOuterR-uInnerR);
  float edge=smoothstep(0.0,0.025,t)*smoothstep(1.0,0.975,t);
  float dR=smoothstep(0.0,0.06,t)*smoothstep(0.11,0.07,t)*0.15;
  float cR=smoothstep(0.11,0.15,t)*smoothstep(0.29,0.25,t)*0.45;
  float mGap=smoothstep(0.02,0.0,abs(t-0.22))*0.9;
  float bR=smoothstep(0.29,0.33,t)*smoothstep(0.52,0.48,t)*1.0;
  float cassini=smoothstep(0.035,0.0,abs(t-0.505))*0.95;
  float aR=smoothstep(0.53,0.57,t)*smoothstep(0.76,0.72,t)*0.75;
  float encke=smoothstep(0.018,0.0,abs(t-0.695))*0.9;
  float keeler=smoothstep(0.008,0.0,abs(t-0.735))*0.85;
  float fR=smoothstep(0.01,0.0,abs(t-0.82))*0.4;
  float ringStr=(dR+cR+bR+aR+fR)*edge;
  ringStr*=(1.0-mGap)*(1.0-cassini)*(1.0-encke)*(1.0-keeler);
  float bands=vnoise1(t*280.0)*0.22+vnoise1(t*140.0)*0.18+vnoise1(t*70.0)*0.12;
  ringStr*=(0.7+bands);
  float azi=vUv.x*3.14159;
  ringStr*=(1.0+sin(azi*12.0+t*40.0)*0.08+sin(azi*5.0+t*20.0)*0.06);
  vec3 ringCol=mix(uRingColor*0.75,uRingColor*1.15,smoothstep(0.29,0.52,t));
  gl_FragColor=vec4(ringCol,ringStr*0.88);
}
`;
