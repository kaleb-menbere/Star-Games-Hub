#ifdef MAPCOLOR
uniform vec3 material_emissive;
#endif

#ifdef MAPFLOAT
uniform float material_emissiveIntensity;
#endif

uniform float uEmissiveScalar;

uniform sampler2D texture_emissiveMap0;
uniform sampler2D texture_emissiveMap1;
uniform sampler2D texture_emissiveMap2;
uniform sampler2D texture_emissiveMap3;

vec4 getTunnelEmissiveTexture(vec2 textureUV){
    
    textureUV.y *= uTunnelTextureCount;
    textureUV.y += uTravelDistance;
    textureUV.y = mod(textureUV.y, uTunnelTextureCount + 1.0);
    int textureIndex = int(floor(textureUV.y));

    
    if(textureIndex == 0){
        return texture2D(texture_emissiveMap0, textureUV);
    }
    else if(textureIndex == 1){
        return texture2D(texture_emissiveMap1, textureUV);
    }
    else if(textureIndex == 2){
        return texture2D(texture_emissiveMap2, textureUV);
    }
    else if(textureIndex == 3){
        return texture2D(texture_emissiveMap3, textureUV);
    }
    
    return texture2D(texture_emissiveMap0, textureUV);
}


vec3 getEmission() {
    vec3 emission = vec3(1.0);
    
    #ifdef MAPFLOAT
    emission *= sineIn(1.0 - $UV.y) * material_emissiveIntensity;
    //emission *= material_emissiveIntensity;
    #endif
    
    #ifdef MAPCOLOR
    emission *= material_emissive;
    #endif

    #ifdef MAPTEXTURE
    //emission *= $texture2DSAMPLE(texture_emissiveMap, $UV).$CH;
    #endif
    vec4 tunnelTex = getTunnelEmissiveTexture($UV);
    emission *= tunnelTex.rgb;


    #ifdef MAPVERTEX
    emission *= gammaCorrectInput(saturate(vVertexColor.$VC));
    #endif
    
    emission *= uEmissiveScalar;

    return emission;
}