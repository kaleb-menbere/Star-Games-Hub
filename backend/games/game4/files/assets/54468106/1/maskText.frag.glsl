
#ifdef GL_OES_standard_derivatives
#define USE_FWIDTH
#endif

#ifdef GL2
#define USE_FWIDTH
#endif

uniform sampler2D texture_opacityMap;

uniform sampler2D texture_maskMap;
uniform bool useTextureMask;

uniform vec4 texture_maskRect;
uniform vec2 texture_maskSize;
uniform bool useTextureMaskRect;
uniform float maskLeft;
uniform float maskRight;
uniform float maskTop;
uniform float maskBottom;
uniform float softClipWidth;
uniform float softClipHeight;


void getOpacity() {
    float alpha = 1.0;
    if(gl_FragCoord.x < maskLeft || gl_FragCoord.x > maskRight || gl_FragCoord.y < maskBottom || gl_FragCoord.y > maskTop){
        discard;
    }
    else{
        float offsetFromLeft = gl_FragCoord.x - maskLeft;
        float offsetFromRight = maskRight - gl_FragCoord.x;
        float offsetFromTop = maskTop - gl_FragCoord.y;
        float offsetFromBottom = gl_FragCoord.y - maskBottom;
        float softClipAlphaX = 1.0;
        float softClipAlphaY = 1.0;
        
        if(offsetFromLeft < softClipWidth){
            softClipAlphaX *= offsetFromLeft / softClipWidth;
        }
        if(offsetFromRight < softClipWidth){
            softClipAlphaX *= offsetFromRight / softClipWidth;
        }
        
        if(offsetFromTop < softClipHeight){
            softClipAlphaY *= offsetFromTop / softClipHeight;
        }
        if(offsetFromBottom < softClipHeight){
            softClipAlphaY *= offsetFromBottom / softClipHeight;
        }
        
        alpha *= (softClipAlphaX * softClipAlphaY);
        
        if(useTextureMask){
            vec2 maskUV = vec2((gl_FragCoord.x - maskLeft) / (maskRight - maskLeft), (gl_FragCoord.y - maskTop) / (maskBottom - maskTop));
            if(useTextureMaskRect){
                float texLeft = texture_maskRect.x / texture_maskSize.x;
                float texRight = texture_maskRect.z / texture_maskSize.x;
                float texTop = texture_maskRect.y / texture_maskSize.y;
                float texBottom = texture_maskRect.w / texture_maskSize.y;
                maskUV.x = mix(texLeft, texRight, maskUV.x);
                maskUV.y = mix(texTop, texBottom, maskUV.y);
            }
            
            float maskAlpha = texture2D(texture_maskMap, maskUV).w;
            alpha *= maskAlpha;
        }
    }
    
    dAlpha = alpha;
}
