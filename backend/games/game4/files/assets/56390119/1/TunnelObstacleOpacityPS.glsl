
#ifdef MAPFLOAT
uniform float baseOpacity;
#endif

#ifdef MAPTEXTURE
uniform sampler2D texture_opacityMap;
#endif

uniform float uAlpha;

void getOpacity() {
    
    float alpha = 1.0;
    
    #ifdef MAPTEXTURE
    alpha *= texture2D(texture_opacityMap, $UV).$CH;
    #endif
    
    alpha *= uAlpha;
    
    dAlpha = alpha;
}


