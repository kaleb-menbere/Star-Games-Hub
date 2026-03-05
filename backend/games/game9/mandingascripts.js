console.log("mandinga loaded");

window.addEventListener("blur", ()=>c2_callFunction("tocarPausa"));

var localisated_text;
var lang="en";
function setLang(newlang){
    lang = newlang; 
}

function exportarConDelay(datos, archivo, delay){
    setTimeout(exportarJSON,delay,datos,archivo);
}
function exportarJSON(datos, archivo){  
    console.log("guardando : "+archivo)  ;
    var a = document.createElement("a");
    var body = document.getElementsByTagName("body")[0];
    a.textContent = archivo;
    a.href = "data:application/json," + encodeURIComponent(datos);
    a.download = archivo;
    body.appendChild(a);
    var clickEvent = document.createEvent("MouseEvent");
    clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(clickEvent);
    body.removeChild(a);
}

function exportarJSONDeObjetos(objetos, archivo){
    var datos = [];
    objetos.forEach((elem)=>{
        datos.push( elem.runtime.saveInstanceToJSON(elem, true) );        
    });
    exportarJSON( JSON.stringify(datos,null,2) , archivo );
}

function cargarJSONLang(json){
    localisated_text = JSON.parse(json);
    console.log(localisated_text);
}
function convertirTextTraducible(objetos){
    objetos.forEach(element => {
        if(element.text && element.textPosta===undefined){
            element.textPosta = element.text;
            element.ptSizePosta = element.ptSize;
            element.ptSizeEscala = 1.0;
            Object.defineProperty(element,"text",{
                get: getTexto,
                set: setTexto,
            });
            Object.defineProperty(element,"ptSize",{
                get: getPtSize,
                set: setPtSize,
            });
            element.text = element.textPosta;
        }
    });
}
function getTexto(){
    return this.textPosta;
}
function setTexto(valor){
    //aca se traduce el texto de input
    if (valor.length == 0 || valor[0]!=='@' || !localisated_text) {
        this.textPosta = valor;
        this.ptSizeEscala=1.0;
    }
    else if(!localisated_text[valor]) {
        console.log(valor+" not found");
        this.textPosta = valor;
        this.ptSizeEscala=1.0;
    }
    else if(!localisated_text[valor][lang]) {
        console.log(valor+" not found on current language ("+lang+")");
        this.textPosta = valor;
        this.ptSizeEscala=1.0;
    }
    else{
        this.textPosta = localisated_text[valor][lang];
        if(this.textPosta.text) this.textPosta = localisated_text[valor][lang].text;
        if(localisated_text[valor][lang].scale){
            if(this.ptSizeEscala!==localisated_text[valor][lang].scale){
                this.ptSizeEscala=localisated_text[valor][lang].scale;
                this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
                this.updateFont();
            }
        }
        else {
            if(this.ptSizeEscala!==1.0){
                this.ptSizeEscala=1.0;
                this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
                this.updateFont();
            }
        }
        console.log(valor+" -> "+ this.textPosta+" ("+this.ptSizeEscala+")");
    }
}

function getPtSize(){
    return this.ptSizePosta*this.ptSizeEscala;
}
function setPtSize(valor){
    this.ptSizePosta = valor;
}

var grupoDeAccion = [];

function parsearNiveles(jsonNiveles){
    jsonNiveles = JSON.parse(jsonNiveles);
    jsonNiveles.forEach((elem)=>{
        c2_callFunction("cargarNivel",JSON.stringify(elem));
    });
}

function agregarAlGrupoDeAccion(objeto){
    grupoDeAccion = grupoDeAccion.concat(objeto);
}
function limpiarGrupoDeAccion(){
    grupoDeAccion.length = 0;
}

function moverGrupoDeAccion(offx, offy){
    grupoDeAccion.forEach(function(objeto){
        objeto.x += offx;
        objeto.y += offy;
        objeto.set_bbox_changed();
    });
}

// generar tapa todo landscape
var imgDom = document.createElement("div");
imgDom.style = "position:fixed;top:0;bottom:0;left:0;right:0;background:url('bg_rotate_device_hd.jpg') black center center no-repeat fixed;background-size:contain;";
imgDom.hidden = true;
document.body.appendChild(imgDom);

function mostrarRotarDevice(mostrar){
    imgDom.hidden = !(mostrar);
    if(mostrar) c2_callFunction("tocarPausa");
}

function darleStrokeAlText(textss) {
    textss.forEach((e)=>{
        e.draw = function(ctx, glmode)
        {
            ctx.font = this.font;
            ctx.textBaseline = "top";
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = e.instance_vars[e.instance_vars.length-1];
            
            ctx.globalAlpha = glmode ? 1 : this.opacity;
    
            var myscale = 1;
            
            if (glmode)
            {
                myscale = Math.abs(this.layer.getScale());
                ctx.save();
                ctx.scale(myscale, myscale);
            }
            
            // If text has changed, run the word wrap.
            if (this.text_changed || this.width !== this.lastwrapwidth)
            {
                this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
                this.text_changed = false;
                this.lastwrapwidth = this.width;
            }
            
            // Draw each line after word wrap
            this.update_bbox();
            var penX = glmode ? 0 : this.bquad.tlx;
            var penY = glmode ? 0 : this.bquad.tly;
            
            if (this.runtime.pixel_rounding)
            {
                penX = (penX + 0.5) | 0;
                penY = (penY + 0.5) | 0;
            }
            
            if (this.angle !== 0 && !glmode)
            {
                ctx.save();
                ctx.translate(penX, penY);
                ctx.rotate(this.angle);
                penX = 0;
                penY = 0;
            }
            
            var endY = penY + this.height;
            var line_height = this.pxHeight;
            line_height += this.line_height_offset;
            var drawX;
            var i;
            
            // Adjust penY for vertical alignment
            if (this.valign === 1)		// center
                penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
            else if (this.valign === 2)	// bottom
                penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
            
            for (i = 0; i < this.lines.length; i++)
            {
                // Adjust the line draw position depending on alignment
                drawX = penX;
                
                if (this.halign === 1)		// center
                    drawX = penX + (this.width - this.lines[i].width) / 2;
                else if (this.halign === 2)	// right
                    drawX = penX + (this.width - this.lines[i].width);
                    
                ctx.strokeText(this.lines[i].text, drawX, penY);
                penY += line_height;
                
                if (penY >= endY - line_height)
                    break;
            }
            
            if (this.angle !== 0 || glmode)
                ctx.restore();
                
            this.last_render_tick = this.runtime.tickcount;
        }
    });
}