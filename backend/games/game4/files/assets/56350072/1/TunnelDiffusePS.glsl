
#ifdef MAPCOLOR
uniform vec3 material_diffuse;
#endif

uniform sampler2D texture_diffuseMap0;
uniform sampler2D texture_diffuseMap1;
uniform sampler2D texture_diffuseMap2;
uniform sampler2D texture_diffuseMap3;

#ifndef HALF_PI
#define HALF_PI 1.5707963267948966
#endif
float qinticIn(float t) {
  return pow(t, 5.0);
}

float sineIn(float t) {
  return sin((t - 1.0) * HALF_PI) + 1.0;
}



uniform float uTravelDistance;
uniform float uTunnelTextureCount;

vec4 getTunnelDiffuseTexture(vec2 textureUV){    
    textureUV.y *= uTunnelTextureCount;
    textureUV.y += uTravelDistance;
    textureUV.y = mod(textureUV.y, uTunnelTextureCount + 1.0);
    int textureIndex = int(floor(textureUV.y));

    
    if(textureIndex == 0){
        return texture2D(texture_diffuseMap0, textureUV);
    }
    else if(textureIndex == 1){
        return texture2D(texture_diffuseMap1, textureUV);
    }
    else if(textureIndex == 2){
        return texture2D(texture_diffuseMap2, textureUV);
    }
    else if(textureIndex == 3){
        return texture2D(texture_diffuseMap3, textureUV);
    }
    
    return texture2D(texture_diffuseMap0, textureUV);
}

void getAlbedo() {
    dAlbedo = vec3(1.0);

    #ifdef MAPCOLOR
    dAlbedo *= material_diffuse.rgb;
    #endif
    
    #ifdef MAPTEXTURE
    //dAlbedo *= texture2D(texture_diffuseMap, $UV).$CH;
    #endif
    
    dAlbedo *= getTunnelDiffuseTexture($UV).rgb;
    
    //dAlbedo = mix(dAlbedo, vec3(1.0), max(0.0, $UV.x - 0.5));
    
    #ifdef MAPVERTEX
    dAlbedo *= gammaCorrectInput(saturate(vVertexColor.$VC));
    #endif
}
