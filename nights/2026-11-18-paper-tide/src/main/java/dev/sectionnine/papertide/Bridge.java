package dev.sectionnine.papertide;

import org.teavm.jso.JSBody;
import org.teavm.jso.JSFunctor;
import org.teavm.jso.JSObject;
import org.teavm.jso.browser.Storage;
import org.teavm.jso.browser.Window;
import org.teavm.jso.typedarrays.Uint32Array;
import org.teavm.jso.webaudio.AudioContext;

/** The only class that speaks to the browser: canvas, events, storage, clocks. */
public final class Bridge {
  private Bridge() {}

  /** A JS callback with no arguments, and one that takes a pointer event. */
  @JSFunctor
  public interface EvFn extends JSObject {
    void call(JSObject event);
  }

  @JSFunctor
  public interface Frame extends JSObject {
    void run(double time);
  }

  @JSFunctor
  public interface StrFn extends JSObject {
    String call();
  }

  @JSFunctor
  public interface PointFn extends JSObject {
    String call(double x, double y);
  }

  /**
   * TeaVM's own AudioContext.create() compiles to a bare `new Context()`, which
   * is not a browser global, so the constructor is written out here instead.
   */
  @JSBody(params = {}, script = "var C=window.AudioContext||window.webkitAudioContext;return C?new C():null;")
  public static native AudioContext newContext();

  @JSBody(params = { "id" }, script = "return document.getElementById(id);")
  public static native JSObject byId(String id);

  /** Wires a canvas to an ImageData and hands Java the 32-bit view of it. */
  @JSBody(params = { "c" }, script = "var ctx=c.getContext('2d');c.__ctx=ctx;c.__img=ctx.createImageData(c.width,c.height);return new Uint32Array(c.__img.data.buffer);")
  public static native Uint32Array wire(JSObject c);

  @JSBody(params = { "c", "w", "h" }, script = "var ctx=c.getContext('2d');ctx.putImageData(c.__img,0,0);")
  public static native void present(JSObject c, int w, int h);

  @JSBody(params = { "target", "type", "fn" }, script = "target.addEventListener(type, fn, {passive:false});")
  public static native void on(JSObject target, String type, EvFn fn);

  @JSBody(params = { "type", "fn" }, script = "document.addEventListener(type, fn);")
  public static native void onDoc(String type, EvFn fn);

  @JSBody(params = { "ev" }, script = "if(ev.preventDefault){ev.preventDefault();}")
  public static native void prevent(JSObject ev);

  @JSBody(params = { "c", "ev" }, script = "if(ev.pointerId!==undefined){c.setPointerCapture(ev.pointerId);}")
  public static native void capture(JSObject c, JSObject ev);

  @JSBody(params = { "c", "ev" }, script = "if(ev.pointerId!==undefined){c.releasePointerCapture(ev.pointerId);}")
  public static native void release(JSObject c, JSObject ev);

  @JSBody(params = { "ev" }, script = "return ev.clientX;")
  public static native double clientX(JSObject ev);

  @JSBody(params = { "ev" }, script = "return ev.clientY;")
  public static native double clientY(JSObject ev);

  @JSBody(params = { "ev" }, script = "return ev.key ? ev.key : '';")
  public static native String key(JSObject ev);

  @JSBody(params = { "c", "sx" }, script = "var r=c.getBoundingClientRect();return (sx-r.left)*c.width/r.width;")
  public static native double worldX(JSObject c, double screenX);

  @JSBody(params = { "c", "sy" }, script = "var r=c.getBoundingClientRect();return (sy-r.top)*c.height/r.height;")
  public static native double worldY(JSObject c, double screenY);

  /** Scales the canvas by a whole number so no row is stretched twice. */
  @JSBody(params = { "c", "w", "h" }, script = "var st=c.parentElement;var aw=st.clientWidth,ah=st.clientHeight;var k=Math.max(1,Math.min(Math.floor(aw/w),Math.floor(ah/h)));c.style.width=(w*k)+'px';c.style.height=(h*k)+'px';")
  public static native void fit(JSObject c, int w, int h);

  @JSBody(params = { "c" }, script = "return c.getBoundingClientRect().width;")
  public static native double cssWidth(JSObject c);

  @JSBody(params = { "fn" }, script = "requestAnimationFrame(fn);")
  public static native void raf(Frame fn);

  @JSBody(params = {}, script = "return performance.now();")
  public static native double now();

  @JSBody(params = {}, script = "return window.matchMedia('(prefers-reduced-motion: reduce)').matches;")
  public static native boolean reducedMotion();

  @JSBody(params = { "id", "text" }, script = "document.getElementById(id).textContent=text;")
  public static native void setText(String id, String text);

  @JSBody(params = { "id", "name", "value" }, script = "document.getElementById(id).setAttribute(name,value);")
  public static native void setAttr(String id, String name, String value);

  @JSBody(params = { "id", "pixels" }, script = "document.getElementById(id).style.width=pixels+'px';")
  public static native void setWidth(String id, String pixels);

  /** A small read-only handle so a check can inspect and drive the page. */
  @JSBody(params = { "readFn", "pixelFn", "tapFn" }, script = "window.paperTide={read:function(){return JSON.parse(readFn());},pixel:function(x,y){return JSON.parse(pixelFn(x,y));},tap:function(x,y){tapFn(x,y);}};")
  public static native void expose(StrFn readFn, PointFn pixelFn, EvThing tapFn);

  @JSFunctor
  public interface EvThing extends JSObject {
    void call(double x, double y);
  }

  public static String load(String key) {
    try {
      Storage st = Window.current().getLocalStorage();
      return st == null ? null : st.getItem(key);
    } catch (Throwable e) {
      return null;
    }
  }

  public static void store(String key, String value) {
    try {
      Storage st = Window.current().getLocalStorage();
      if (st != null) {
        st.setItem(key, value);
      }
    } catch (Throwable e) {
      // A private window without storage simply forgets the choice.
    }
  }
}
