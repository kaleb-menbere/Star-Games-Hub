#ifdef MAPCOLOR
uniform vec3 material_emissive;
#endif

#ifdef MAPFLOAT
uniform float material_emissiveIntensity;
#endif

#ifdef MAPTEXTURE
uniform sampler2D texture_emissiveMap;
#endif

uniform float uEmissiveScalar;

#ifndef HALF_PI
#define HALF_PI 1.5707963267948966
#endif
uniform float progress;


float sineIn(float t) {
  return sin((t - 1.0) * HALF_PI) + 1.0;
}


vec3 getEmission() {
    vec3 emission = vec3(1.0);
    
    #ifdef MAPCOLOR
    emission *= material_emissive;
    #endif
    
    #ifdef MAPFLOAT
    emission *= material_emissiveIntensity;
    #endif
    

    #ifdef MAPTEXTURE
    vec4 emissiveMap = $texture2DSAMPLE(texture_emissiveMap, $UV);
    emission *= emissiveMap.rgb;
    #endif
    
    
    //emission *= getTunnelAlbedo($UV);

    #ifdef MAPVERTEX
    emission *= gammaCorrectInput(saturate(vVertexColor.$VC));
    #endif
    
    emission *= uEmissiveScalar;

    return emission;
}