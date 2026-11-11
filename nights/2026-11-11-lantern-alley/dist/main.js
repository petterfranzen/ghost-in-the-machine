(function(){
'use strict';
var $fileLevelThis = this;
var $getOwnPropertyDescriptors = (Object.getOwnPropertyDescriptors || (() => {
  var ownKeysFun;
  if ((((typeof Reflect) !== "undefined") && Reflect.ownKeys)) {
    ownKeysFun = Reflect.ownKeys;
  } else {
    var getOwnPropertySymbols = (Object.getOwnPropertySymbols || ((o) => []));
    ownKeysFun = ((o) => Object.getOwnPropertyNames(o).concat(getOwnPropertySymbols(o)));
  }
  return ((o) => {
    var ownKeys = ownKeysFun(o);
    var descriptors = ({});
    var len = (ownKeys.length | 0);
    var i = 0;
    while ((i !== len)) {
      var key = ownKeys[i];
      Object.defineProperty(descriptors, key, ({
        "configurable": true,
        "enumerable": true,
        "writable": true,
        "value": Object.getOwnPropertyDescriptor(o, key)
      }));
      i = ((i + 1) | 0);
    }
    return descriptors;
  });
})());
function $Char(c) {
  this.c = c;
}
$Char.prototype.toString = (function() {
  return String.fromCharCode(this.c);
});
function $Long(lo, hi) {
  this.l = lo;
  this.h = hi;
}
$Long.prototype.toString = (function() {
  return $s_RTLong__toString__I__I__T(this.l, this.h);
});
function $valueDescription(arg0) {
  return (((typeof arg0) === "number") ? (((arg0 === 0) && ((1 / arg0) < 0)) ? "number(-0)" : (("number(" + arg0) + ")")) : ((arg0 instanceof $Long) ? "long" : ((arg0 instanceof $Char) ? "char" : ((!(!(arg0 && arg0.$classData))) ? arg0.$classData.name : (typeof arg0)))));
}
function $throwClassCastException(arg0, arg1) {
  throw new $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError(new $c_jl_ClassCastException((($valueDescription(arg0) + " cannot be cast to ") + arg1)));
}
function $throwArrayCastException(arg0, arg1, arg2) {
  while ((--arg2)) {
    arg1 = ("[" + arg1);
  }
  $throwClassCastException(arg0, arg1);
}
function $throwArrayIndexOutOFBoundsException(arg0) {
  throw new $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError($ct_jl_ArrayIndexOutOfBoundsException__T__(new $c_jl_ArrayIndexOutOfBoundsException(), ((arg0 === null) ? null : ("" + arg0))));
}
function $throwArrayStoreException(arg0) {
  throw new $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError(new $c_jl_ArrayStoreException(((arg0 === null) ? null : $valueDescription(arg0))));
}
function $throwNegativeArraySizeException() {
  throw new $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError(new $c_jl_NegativeArraySizeException());
}
function $throwNullPointerException() {
  throw new $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError($ct_jl_NullPointerException__(new $c_jl_NullPointerException()));
}
function $n(arg0) {
  if ((arg0 === null)) {
    $throwNullPointerException();
  }
  return arg0;
}
function $noIsInstance(arg0) {
  throw new TypeError("Cannot call isInstance() on a Class representing a JS trait/object");
}
function $objectClone(arg0) {
  return Object.create(Object.getPrototypeOf(arg0), $getOwnPropertyDescriptors(arg0));
}
function $objectOrArrayClone(arg0) {
  return (arg0.$classData.isArrayClass ? arg0.clone__O() : $objectClone(arg0));
}
function $aJCheckGet(arg0, arg1) {
  if (((arg1 >>> 0) >= (arg0.length >>> 1))) {
    $throwArrayIndexOutOFBoundsException(arg1);
  }
  return (arg1 << 1);
}
function $objectGetClass(arg0) {
  switch ((typeof arg0)) {
    case "string": {
      return $d_T.getClassOf();
    }
    case "number": {
      if ($isInt(arg0)) {
        if ((((arg0 << 24) >> 24) === arg0)) {
          return $d_jl_Byte.getClassOf();
        } else if ((((arg0 << 16) >> 16) === arg0)) {
          return $d_jl_Short.getClassOf();
        } else {
          return $d_jl_Integer.getClassOf();
        }
      } else if ($isFloat(arg0)) {
        return $d_jl_Float.getClassOf();
      } else {
        return $d_jl_Double.getClassOf();
      }
    }
    case "boolean": {
      return $d_jl_Boolean.getClassOf();
    }
    case "undefined": {
      return $d_jl_Void.getClassOf();
    }
    default: {
      if ((arg0 instanceof $Long)) {
        return $d_jl_Long.getClassOf();
      } else if ((arg0 instanceof $Char)) {
        return $d_jl_Character.getClassOf();
      } else if ((!(!(arg0 && arg0.$classData)))) {
        return arg0.$classData.getClassOf();
      } else {
        return null;
      }
    }
  }
}
function $objectClassName(arg0) {
  switch ((typeof arg0)) {
    case "string": {
      return "java.lang.String";
    }
    case "number": {
      if ($isInt(arg0)) {
        if ((((arg0 << 24) >> 24) === arg0)) {
          return "java.lang.Byte";
        } else if ((((arg0 << 16) >> 16) === arg0)) {
          return "java.lang.Short";
        } else {
          return "java.lang.Integer";
        }
      } else if ($isFloat(arg0)) {
        return "java.lang.Float";
      } else {
        return "java.lang.Double";
      }
    }
    case "boolean": {
      return "java.lang.Boolean";
    }
    case "undefined": {
      return "java.lang.Void";
    }
    default: {
      if ((arg0 instanceof $Long)) {
        return "java.lang.Long";
      } else if ((arg0 instanceof $Char)) {
        return "java.lang.Character";
      } else if ((!(!(arg0 && arg0.$classData)))) {
        return arg0.$classData.name;
      } else {
        return $throwNullPointerException();
      }
    }
  }
}
function $dp_equals__O__Z(instance, x0) {
  switch ((typeof instance)) {
    case "string": {
      return $f_T__equals__O__Z(instance, x0);
    }
    case "number": {
      return $f_jl_Double__equals__O__Z(instance, x0);
    }
    case "boolean": {
      return $f_jl_Boolean__equals__O__Z(instance, x0);
    }
    case "undefined": {
      return $f_jl_Void__equals__O__Z(instance, x0);
    }
    default: {
      if (((!(!(instance && instance.$classData))) || (instance === null))) {
        return instance.equals__O__Z(x0);
      } else if ((instance instanceof $Long)) {
        return $f_jl_Long__equals__O__Z(instance.l, instance.h, x0);
      } else if ((instance instanceof $Char)) {
        return $f_jl_Character__equals__O__Z(instance.c, x0);
      } else {
        return $c_O.prototype.equals__O__Z.call(instance, x0);
      }
    }
  }
}
function $dp_hashCode__I(instance) {
  switch ((typeof instance)) {
    case "string": {
      return $f_T__hashCode__I(instance);
    }
    case "number": {
      return $f_jl_Double__hashCode__I(instance);
    }
    case "boolean": {
      return $f_jl_Boolean__hashCode__I(instance);
    }
    case "undefined": {
      return $f_jl_Void__hashCode__I(instance);
    }
    default: {
      if (((!(!(instance && instance.$classData))) || (instance === null))) {
        return instance.hashCode__I();
      } else if ((instance instanceof $Long)) {
        return $f_jl_Long__hashCode__I(instance.l, instance.h);
      } else if ((instance instanceof $Char)) {
        return $f_jl_Character__hashCode__I(instance.c);
      } else {
        return $c_O.prototype.hashCode__I.call(instance);
      }
    }
  }
}
function $dp_toString__T(instance) {
  return ((instance === (void 0)) ? "undefined" : instance.toString());
}
function $checkIntDivisor(arg0) {
  if ((arg0 === 0)) {
    throw new $c_jl_ArithmeticException("/ by zero");
  } else {
    return arg0;
  }
}
function $doubleToInt(arg0) {
  return ((arg0 > 2147483647) ? 2147483647 : ((arg0 < (-2147483648)) ? (-2147483648) : (arg0 | 0)));
}
function $cToS(arg0) {
  return String.fromCharCode(arg0);
}
function $charAt(arg0, arg1) {
  var r = arg0.charCodeAt(arg1);
  if ((r !== r)) {
    throw new $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError(new $c_jl_StringIndexOutOfBoundsException(arg1));
  } else {
    return r;
  }
}
var $fpBitsDataView = new DataView(new ArrayBuffer(8));
function $floatToBits(arg0) {
  var dataView = $fpBitsDataView;
  dataView.setFloat32(0, arg0, true);
  return dataView.getInt32(0, true);
}
function $floatFromBits(arg0) {
  var dataView = $fpBitsDataView;
  dataView.setInt32(0, arg0, true);
  return dataView.getFloat32(0, true);
}
function $doubleToBits(arg0) {
  var dataView = $fpBitsDataView;
  return $s_RTLong__fromDoubleBits__D__O__J(arg0, dataView);
}
function $doubleFromBits(arg0) {
  var dataView = $fpBitsDataView;
  return $s_RTLong__bitsToDouble__I__I__O__D(arg0.l, arg0.h, dataView);
}
function $resolveSuperRef(arg0, arg1) {
  var getPrototypeOf = Object.getPrototyeOf;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var superProto = arg0.prototype;
  while ((superProto !== null)) {
    var desc = getOwnPropertyDescriptor(superProto, arg1);
    if ((desc !== (void 0))) {
      return desc;
    }
    superProto = getPrototypeOf(superProto);
  }
}
function $superGet(arg0, arg1, arg2) {
  var desc = $resolveSuperRef(arg0, arg2);
  if ((desc !== (void 0))) {
    var getter = desc.get;
    return ((getter !== (void 0)) ? getter.call(arg1) : getter.value);
  }
}
function $superSet(arg0, arg1, arg2, arg3) {
  var desc = $resolveSuperRef(arg0, arg2);
  if ((desc !== (void 0))) {
    var setter = desc.set;
    if ((setter !== (void 0))) {
      setter.call(arg1, arg3);
      return (void 0);
    }
  }
  throw new TypeError((("super has no setter '" + arg2) + "'."));
}
function $arraycopyCheckBounds(arg0, arg1, arg2, arg3, arg4) {
  if ((((((arg1 | arg3) | arg4) < 0) || (arg1 > ((arg0 - arg4) | 0))) || (arg3 > ((arg2 - arg4) | 0)))) {
    $throwArrayIndexOutOFBoundsException(null);
  }
}
function $arraycopyGeneric(arg0, arg1, arg2, arg3, arg4) {
  $arraycopyCheckBounds(arg0.length, arg1, arg2.length, arg3, arg4);
  if (((arg0 !== arg2) || (((arg3 - arg1) >>> 0) > (arg4 >>> 0)))) {
    for (var i = 0; (i < arg4); i = ((i + 1) | 0)) {
      arg2[((arg3 + i) | 0)] = arg0[((arg1 + i) | 0)];
    }
  } else {
    for (var i = ((arg4 - 1) | 0); (i >= 0); i = ((i - 1) | 0)) {
      arg2[((arg3 + i) | 0)] = arg0[((arg1 + i) | 0)];
    }
  }
}
function $systemArraycopy(arg0, arg1, arg2, arg3, arg4) {
  arg0.copyTo(arg1, arg2, arg3, arg4);
}
function $systemArraycopyRefs(arg0, arg1, arg2, arg3, arg4) {
  if (arg2.$classData.isAssignableFrom(arg0.$classData)) {
    $arraycopyGeneric(arg0.u, arg1, arg2.u, arg3, arg4);
  } else {
    var srcArray = arg0.u;
    $arraycopyCheckBounds(srcArray.length, arg1, arg2.u.length, arg3, arg4);
    for (var i = 0; (i < arg4); i = ((i + 1) | 0)) {
      arg2.set(((arg3 + i) | 0), srcArray[((arg1 + i) | 0)]);
    }
  }
}
function $systemArraycopyFull(arg0, arg1, arg2, arg3, arg4) {
  var srcData = (arg0 && arg0.$classData);
  if ((srcData === (arg2 && arg2.$classData))) {
    if ((srcData && srcData.isArrayClass)) {
      $systemArraycopy(arg0, arg1, arg2, arg3, arg4);
    } else {
      $throwArrayStoreException(null);
    }
  } else if (((arg0 instanceof $ac_O) && (arg2 instanceof $ac_O))) {
    $systemArraycopyRefs(arg0, arg1, arg2, arg3, arg4);
  } else {
    $throwArrayStoreException(null);
  }
}
var $lastIDHash = 0;
var $idHashCodeMap = new WeakMap();
function $systemIdentityHashCode(obj) {
  switch ((typeof obj)) {
    case "string": {
      return $f_T__hashCode__I(obj);
    }
    case "number": {
      return $f_jl_Double__hashCode__I(obj);
    }
    case "bigint": {
      var biHash = 0;
      if ((obj < BigInt(0))) {
        obj = (~obj);
      }
      while ((obj !== BigInt(0))) {
        biHash = (biHash ^ Number(BigInt.asIntN(32, obj)));
        obj = (obj >> BigInt(32));
      }
      return biHash;
    }
    case "boolean": {
      return (obj ? 1231 : 1237);
    }
    case "undefined": {
      return 0;
    }
    case "symbol": {
      var description = obj.description;
      return ((description === (void 0)) ? 0 : $f_T__hashCode__I(description));
    }
    default: {
      if ((obj === null)) {
        return 0;
      } else {
        var hash = $idHashCodeMap.get(obj);
        if ((hash === (void 0))) {
          hash = (($lastIDHash + 1) | 0);
          $lastIDHash = hash;
          $idHashCodeMap.set(obj, hash);
        }
        return hash;
      }
    }
  }
}
function $isByte(arg0) {
  return ((((typeof arg0) === "number") && (((arg0 << 24) >> 24) === arg0)) && ((1 / arg0) !== (1 / (-0))));
}
function $isShort(arg0) {
  return ((((typeof arg0) === "number") && (((arg0 << 16) >> 16) === arg0)) && ((1 / arg0) !== (1 / (-0))));
}
function $isInt(arg0) {
  return ((((typeof arg0) === "number") && ((arg0 | 0) === arg0)) && ((1 / arg0) !== (1 / (-0))));
}
function $isFloat(arg0) {
  return (((typeof arg0) === "number") && ((arg0 !== arg0) || (Math.fround(arg0) === arg0)));
}
function $bC(arg0) {
  return new $Char(arg0);
}
var $bC0 = $bC(0);
function $bL(arg0, arg1) {
  return new $Long(arg0, arg1);
}
var $bL0 = $bL(0, 0);
function $uV(arg0) {
  return (((arg0 === (void 0)) || (arg0 === null)) ? (void 0) : $throwClassCastException(arg0, "java.lang.Void"));
}
function $uZ(arg0) {
  return ((((typeof arg0) === "boolean") || (arg0 === null)) ? (!(!arg0)) : $throwClassCastException(arg0, "java.lang.Boolean"));
}
function $uC(arg0) {
  return (((arg0 instanceof $Char) || (arg0 === null)) ? ((arg0 === null) ? 0 : arg0.c) : $throwClassCastException(arg0, "java.lang.Character"));
}
function $uB(arg0) {
  return (($isByte(arg0) || (arg0 === null)) ? (arg0 | 0) : $throwClassCastException(arg0, "java.lang.Byte"));
}
function $uS(arg0) {
  return (($isShort(arg0) || (arg0 === null)) ? (arg0 | 0) : $throwClassCastException(arg0, "java.lang.Short"));
}
function $uI(arg0) {
  return (($isInt(arg0) || (arg0 === null)) ? (arg0 | 0) : $throwClassCastException(arg0, "java.lang.Integer"));
}
function $uJ(arg0) {
  return (((arg0 instanceof $Long) || (arg0 === null)) ? ((arg0 === null) ? $bL0 : arg0) : $throwClassCastException(arg0, "java.lang.Long"));
}
function $uF(arg0) {
  return (($isFloat(arg0) || (arg0 === null)) ? (+arg0) : $throwClassCastException(arg0, "java.lang.Float"));
}
function $uD(arg0) {
  return ((((typeof arg0) === "number") || (arg0 === null)) ? (+arg0) : $throwClassCastException(arg0, "java.lang.Double"));
}
function $uT(arg0) {
  return ((((typeof arg0) === "string") || (arg0 === null)) ? ((arg0 === null) ? "" : arg0) : $throwClassCastException(arg0, "java.lang.String"));
}
function $ct_O__($thiz) {
  return $thiz;
}
/** @constructor */
function $c_O() {
}
$c_O.prototype.constructor = $c_O;
/** @constructor */
function $h_O() {
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this);
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that);
});
$c_O.prototype.toString__T = (function() {
  var i = this.hashCode__I();
  return (($objectClassName(this) + "@") + $as_T((i >>> 0.0).toString(16)));
});
$c_O.prototype.toString = (function() {
  return this.toString__T();
});
function $ac_O(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Array(arg);
    for (var i = 0; (i < arg); (i++)) {
      this.u[i] = null;
    }
  } else {
    this.u = arg;
  }
}
$ac_O.prototype = new $h_O();
$ac_O.prototype.constructor = $ac_O;
$ac_O.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_O.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_O.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyGeneric(this.u, srcPos, dest.u, destPos, length);
});
$ac_O.prototype.clone__O = (function() {
  return new $ac_O(this.u.slice());
});
function $ah_O() {
}
$ah_O.prototype = $ac_O.prototype;
function $ac_Z(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Array(arg);
    for (var i = 0; (i < arg); (i++)) {
      this.u[i] = false;
    }
  } else {
    this.u = arg;
  }
}
$ac_Z.prototype = new $h_O();
$ac_Z.prototype.constructor = $ac_Z;
$ac_Z.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_Z.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_Z.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyGeneric(this.u, srcPos, dest.u, destPos, length);
});
$ac_Z.prototype.clone__O = (function() {
  return new $ac_Z(this.u.slice());
});
function $ac_C(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Uint16Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_C.prototype = new $h_O();
$ac_C.prototype.constructor = $ac_C;
$ac_C.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_C.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_C.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(this.u.length, srcPos, dest.u.length, destPos, length);
  dest.u.set(this.u.subarray(srcPos, ((srcPos + length) | 0)), destPos);
});
$ac_C.prototype.clone__O = (function() {
  return new $ac_C(this.u.slice());
});
function $ac_B(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Int8Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_B.prototype = new $h_O();
$ac_B.prototype.constructor = $ac_B;
$ac_B.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_B.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_B.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(this.u.length, srcPos, dest.u.length, destPos, length);
  dest.u.set(this.u.subarray(srcPos, ((srcPos + length) | 0)), destPos);
});
$ac_B.prototype.clone__O = (function() {
  return new $ac_B(this.u.slice());
});
function $ac_S(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Int16Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_S.prototype = new $h_O();
$ac_S.prototype.constructor = $ac_S;
$ac_S.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_S.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_S.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(this.u.length, srcPos, dest.u.length, destPos, length);
  dest.u.set(this.u.subarray(srcPos, ((srcPos + length) | 0)), destPos);
});
$ac_S.prototype.clone__O = (function() {
  return new $ac_S(this.u.slice());
});
function $ac_I(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Int32Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_I.prototype = new $h_O();
$ac_I.prototype.constructor = $ac_I;
$ac_I.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_I.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_I.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(this.u.length, srcPos, dest.u.length, destPos, length);
  dest.u.set(this.u.subarray(srcPos, ((srcPos + length) | 0)), destPos);
});
$ac_I.prototype.clone__O = (function() {
  return new $ac_I(this.u.slice());
});
function $ac_J(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    arg = (arg << 1);
    this.u = new Int32Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_J.prototype = new $h_O();
$ac_J.prototype.constructor = $ac_J;
$ac_J.prototype.set = (function(i, v, w) {
  if (((i >>> 0) >= (((this.u.length >>> 1) | 0) >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  i = (i << 1);
  this.u[i] = v;
  this.u[((i + 1) | 0)] = w;
});
$ac_J.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(((this.u.length >>> 1) | 0), srcPos, ((dest.u.length >>> 1) | 0), destPos, length);
  dest.u.set(this.u.subarray((srcPos << 1), (((srcPos + length) | 0) << 1)), (destPos << 1));
});
$ac_J.prototype.clone__O = (function() {
  return new $ac_J(this.u.slice());
});
function $ac_F(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Float32Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_F.prototype = new $h_O();
$ac_F.prototype.constructor = $ac_F;
$ac_F.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_F.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_F.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(this.u.length, srcPos, dest.u.length, destPos, length);
  dest.u.set(this.u.subarray(srcPos, ((srcPos + length) | 0)), destPos);
});
$ac_F.prototype.clone__O = (function() {
  return new $ac_F(this.u.slice());
});
function $ac_D(arg) {
  if (((typeof arg) === "number")) {
    if ((arg < 0)) {
      $throwNegativeArraySizeException();
    }
    this.u = new Float64Array(arg);
  } else {
    this.u = arg;
  }
}
$ac_D.prototype = new $h_O();
$ac_D.prototype.constructor = $ac_D;
$ac_D.prototype.get = (function(i) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  return this.u[i];
});
$ac_D.prototype.set = (function(i, v) {
  if (((i >>> 0) >= (this.u.length >>> 0))) {
    $throwArrayIndexOutOFBoundsException(i);
  }
  this.u[i] = v;
});
$ac_D.prototype.copyTo = (function(srcPos, dest, destPos, length) {
  $arraycopyCheckBounds(this.u.length, srcPos, dest.u.length, destPos, length);
  dest.u.set(this.u.subarray(srcPos, ((srcPos + length) | 0)), destPos);
});
$ac_D.prototype.clone__O = (function() {
  return new $ac_D(this.u.slice());
});
function $TypeData() {
  this.constr = (void 0);
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = (void 0);
  this._arrayOf = (void 0);
  this.isAssignableFromFun = (void 0);
  this.wrapArray = (void 0);
  this.isJSType = false;
  this.name = "";
  this.isPrimitive = false;
  this.isInterface = false;
  this.isArrayClass = false;
  this.isInstance = (void 0);
}
$TypeData.prototype.initPrim = (function(zero, arrayEncodedName, displayName, arrayClass, typedArrayClass) {
  this.ancestors = ({});
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  var self = this;
  this.isAssignableFromFun = ((that) => (that === self));
  this.name = displayName;
  this.isPrimitive = true;
  this.isInstance = ((obj) => false);
  if ((arrayClass !== (void 0))) {
    this._arrayOf = new $TypeData().initSpecializedArray(this, arrayClass, typedArrayClass, (arrayEncodedName === "J"));
  }
  return this;
});
$TypeData.prototype.initClass = (function(kindOrCtor, fullName, ancestors, isInstance) {
  var internalName = Object.getOwnPropertyNames(ancestors)[0];
  this.ancestors = ancestors;
  this.arrayEncodedName = (("L" + fullName) + ";");
  this.isAssignableFromFun = ((that) => (!(!that.ancestors[internalName])));
  this.isJSType = (kindOrCtor === 2);
  this.name = fullName;
  this.isInterface = (kindOrCtor === 1);
  this.isInstance = (isInstance || ((obj) => (!(!((obj && obj.$classData) && obj.$classData.ancestors[internalName])))));
  if (((typeof kindOrCtor) !== "number")) {
    kindOrCtor.prototype.$classData = this;
  }
  return this;
});
$TypeData.prototype.initSpecializedArray = (function(componentData, arrayClass, typedArrayClass, isLongArray, isAssignableFromFun) {
  arrayClass.prototype.$classData = this;
  var name = ("[" + componentData.arrayEncodedName);
  this.constr = arrayClass;
  this.ancestors = ({
    jl_Cloneable: 1,
    Ljava_io_Serializable: 1
  });
  this.componentData = componentData;
  this.arrayBase = componentData;
  this.arrayDepth = 1;
  this.arrayEncodedName = name;
  this.name = name;
  this.isArrayClass = true;
  var self = this;
  this.isAssignableFromFun = (isAssignableFromFun || ((that) => (self === that)));
  this.wrapArray = (isLongArray ? ((array) => {
    var len = (array.length | 0);
    var result = new arrayClass(len);
    var u = result.u;
    for (var i = 0; (i < len); i = ((i + 1) | 0)) {
      var srcElem = array[i];
      u[(i << 1)] = srcElem.l;
      u[(((i << 1) + 1) | 0)] = srcElem.h;
    }
    return result;
  }) : (typedArrayClass ? ((array) => new arrayClass(new typedArrayClass(array))) : ((array) => new arrayClass(array))));
  this.isInstance = ((obj) => (obj instanceof arrayClass));
  return this;
});
$TypeData.prototype.initArray = (function(componentData) {
  function ArrayClass(arg) {
    if (((typeof arg) === "number")) {
      if ((arg < 0)) {
        $throwNegativeArraySizeException();
      }
      this.u = new Array(arg);
      for (var i = 0; (i < arg); (i++)) {
        this.u[i] = null;
      }
    } else {
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $ah_O();
  ArrayClass.prototype.constructor = ArrayClass;
  ArrayClass.prototype.set = (function(i, v) {
    if (((i >>> 0) >= (this.u.length >>> 0))) {
      $throwArrayIndexOutOFBoundsException(i);
    }
    if ((((v !== null) && (!componentData.isJSType)) && (!componentData.isInstance(v)))) {
      $throwArrayStoreException(v);
    }
    this.u[i] = v;
  });
  ArrayClass.prototype.copyTo = (function(srcPos, dest, destPos, length) {
    $arraycopyGeneric(this.u, srcPos, dest.u, destPos, length);
  });
  ArrayClass.prototype.clone__O = (function() {
    return new ArrayClass(this.u.slice());
  });
  ArrayClass.prototype.$classData = this;
  var arrayBase = (componentData.arrayBase || componentData);
  var arrayDepth = (componentData.arrayDepth + 1);
  var name = ("[" + componentData.arrayEncodedName);
  this.constr = ArrayClass;
  this.ancestors = ({
    jl_Cloneable: 1,
    Ljava_io_Serializable: 1
  });
  this.componentData = componentData;
  this.arrayBase = arrayBase;
  this.arrayDepth = arrayDepth;
  this.arrayEncodedName = name;
  this.name = name;
  this.isArrayClass = true;
  var isAssignableFromFun = ((that) => {
    var thatDepth = that.arrayDepth;
    return ((thatDepth === arrayDepth) ? arrayBase.isAssignableFromFun(that.arrayBase) : ((thatDepth > arrayDepth) && (arrayBase === $d_O)));
  });
  this.isAssignableFromFun = isAssignableFromFun;
  this.wrapArray = ((array) => new ArrayClass(array));
  var self = this;
  this.isInstance = ((obj) => {
    var data = (obj && obj.$classData);
    return ((!(!data)) && ((data === self) || isAssignableFromFun(data)));
  });
  return this;
});
$TypeData.prototype.getArrayOf = (function() {
  if ((!this._arrayOf)) {
    this._arrayOf = new $TypeData().initArray(this);
  }
  return this._arrayOf;
});
$TypeData.prototype.getClassOf = (function() {
  if ((!this._classOf)) {
    this._classOf = new $c_jl_Class(this);
  }
  return this._classOf;
});
$TypeData.prototype.isAssignableFrom = (function(that) {
  return ((this === that) || this.isAssignableFromFun(that));
});
$TypeData.prototype.cast = (function(obj) {
  if ((((obj !== null) && (!this.isJSType)) && (!this.isInstance(obj)))) {
    $throwClassCastException(obj, this.name);
  }
  return obj;
});
$TypeData.prototype.getSuperclass = (function() {
  return (this.parentData ? this.parentData.getClassOf() : null);
});
$TypeData.prototype.getComponentType = (function() {
  return (this.componentData ? this.componentData.getClassOf() : null);
});
$TypeData.prototype.newArray = (function(length) {
  if ((this === $d_V)) {
    throw $ct_jl_IllegalArgumentException__(new $c_jl_IllegalArgumentException());
  }
  return new (this.getArrayOf().constr)(length);
});
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false;
  } else {
    var arrayDepth = data.arrayDepth;
    return ((arrayDepth === depth) ? (!data.arrayBase.isPrimitive) : (arrayDepth > depth));
  }
}
function $isArrayOf_Z(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_Z))));
}
function $isArrayOf_C(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_C))));
}
function $isArrayOf_B(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_B))));
}
function $isArrayOf_S(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_S))));
}
function $isArrayOf_I(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_I))));
}
function $isArrayOf_J(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_J))));
}
function $isArrayOf_F(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_F))));
}
function $isArrayOf_D(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && (obj.$classData.arrayBase === $d_D))));
}
function $asArrayOf_O(obj, depth) {
  if (($isArrayOf_O(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "Ljava.lang.Object;", depth);
  }
}
function $asArrayOf_Z(obj, depth) {
  if (($isArrayOf_Z(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "Z", depth);
  }
}
function $asArrayOf_C(obj, depth) {
  if (($isArrayOf_C(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "C", depth);
  }
}
function $asArrayOf_B(obj, depth) {
  if (($isArrayOf_B(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "B", depth);
  }
}
function $asArrayOf_S(obj, depth) {
  if (($isArrayOf_S(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "S", depth);
  }
}
function $asArrayOf_I(obj, depth) {
  if (($isArrayOf_I(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "I", depth);
  }
}
function $asArrayOf_J(obj, depth) {
  if (($isArrayOf_J(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "J", depth);
  }
}
function $asArrayOf_F(obj, depth) {
  if (($isArrayOf_F(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "F", depth);
  }
}
function $asArrayOf_D(obj, depth) {
  if (($isArrayOf_D(obj, depth) || (obj === null))) {
    return obj;
  } else {
    $throwArrayCastException(obj, "D", depth);
  }
}
var $d_O = new $TypeData();
$d_O.ancestors = ({});
$d_O.arrayEncodedName = "Ljava.lang.Object;";
$d_O.isAssignableFromFun = ((that) => (!that.isPrimitive));
$d_O.name = "java.lang.Object";
$d_O.isInstance = ((obj) => (obj !== null));
$d_O._arrayOf = new $TypeData().initSpecializedArray($d_O, $ac_O, (void 0), false, ((that) => {
  var thatDepth = that.arrayDepth;
  return ((thatDepth === 1) ? (!that.arrayBase.isPrimitive) : (thatDepth > 1));
}));
$c_O.prototype.$classData = $d_O;
var $d_V = new $TypeData().initPrim((void 0), "V", "void", (void 0), (void 0));
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean", $ac_Z, (void 0));
var $d_C = new $TypeData().initPrim(0, "C", "char", $ac_C, Uint16Array);
var $d_B = new $TypeData().initPrim(0, "B", "byte", $ac_B, Int8Array);
var $d_S = new $TypeData().initPrim(0, "S", "short", $ac_S, Int16Array);
var $d_I = new $TypeData().initPrim(0, "I", "int", $ac_I, Int32Array);
var $d_J = new $TypeData().initPrim($bL0, "J", "long", $ac_J, Int32Array);
var $d_F = new $TypeData().initPrim(0.0, "F", "float", $ac_F, Float32Array);
var $d_D = new $TypeData().initPrim(0.0, "D", "double", $ac_D, Float64Array);
var $typedArraysAreBigEndian = (new Int8Array(new Int32Array([1]).buffer)[0] === 0);
function $constArrayBuffer_B(len, encoded) {
  var buf = new ArrayBuffer(len);
  var view = new DataView(buf);
  var regularChunksEnd = ((encoded.length - 4) | 0);
  var i = 0;
  var j = 0;
  var chunk = 0;
  while (true) {
    chunk = (((encoded.charCodeAt(i) | (encoded.charCodeAt(((i + 1) | 0)) << 8)) | (encoded.charCodeAt(((i + 2) | 0)) << 16)) | (encoded.charCodeAt(((i + 3) | 0)) << 24));
    chunk = ((((chunk - 808464432) | 0) - ((chunk & 1616928864) >>> 3)) | 0);
    chunk = (((chunk & 1056980736) >>> 2) | (chunk & 4128831));
    chunk = (((chunk & 268369920) >>> 4) | (chunk & 4095));
    if ((i === regularChunksEnd)) {
      break;
    }
    view.setUint32(j, chunk, true);
    i = ((i + 4) | 0);
    j = ((j + 3) | 0);
  }
  var trailing = ((len - j) | 0);
  view.setUint8(j, chunk);
  if ((trailing !== 1)) {
    view.setUint8(((j + 1) | 0), (chunk >>> 8));
    if ((trailing === 3)) {
      view.setUint8(((j + 2) | 0), (chunk >>> 16));
    }
  }
  return buf;
}
function $constArrayBuffer_S(len, encoded) {
  var buf = $constArrayBuffer_B((len << 1), encoded);
  if ($typedArraysAreBigEndian) {
    var view = new DataView(buf);
    var i = 0;
    while ((i !== len)) {
      view.putInt16(i, view.getInt16(i, true), false);
      i = ((i + 2) | 0);
    }
  }
  return buf;
}
function $constArrayBuffer_I(len, encoded) {
  var buf = $constArrayBuffer_B((len << 2), encoded);
  if ($typedArraysAreBigEndian) {
    var view = new DataView(buf);
    var i = 0;
    while ((i !== len)) {
      view.putInt32(i, view.getInt32(i, true), false);
      i = ((i + 4) | 0);
    }
  }
  return buf;
}
function $constArrayBuffer_J(len, encoded) {
  return $constArrayBuffer_I((len << 1), encoded);
}
function $constTypedArrayU_I(len, encoded, prevMask) {
  var buf = new Int32Array(len);
  var inLen = (encoded.length | 0);
  var prev = 0;
  var i = 0;
  var j = 0;
  var v = 0;
  while ((i !== inLen)) {
    var c = encoded.charCodeAt(i);
    if ((c < 80)) {
      v = ((v | (c - 48)) << 5);
    } else {
      v = (v | (c - 93));
      prev = (((prev & prevMask) + v) | 0);
      buf[j] = prev;
      j = ((j + 1) | 0);
      v = 0;
    }
    i = ((i + 1) | 0);
  }
  return buf;
}
function $constTypedArrayS_I(len, encoded, prevMask) {
  var buf = new Int32Array(len);
  var inLen = (encoded.length | 0);
  var prev = 0;
  var i = 0;
  var j = 0;
  var v = 0;
  var first = true;
  while ((i !== inLen)) {
    var c = encoded.charCodeAt(i);
    if ((c < 80)) {
      if (first) {
        v = (((c - 48) << 27) >> 22);
        first = false;
      } else {
        v = ((v | (c - 48)) << 5);
      }
    } else {
      if (first) {
        v = (((c - 93) << 27) >> 27);
      } else {
        v = (v | (c - 93));
        first = true;
      }
      prev = (((prev & prevMask) + v) | 0);
      buf[j] = prev;
      j = ((j + 1) | 0);
    }
    i = ((i + 1) | 0);
  }
  return buf;
}
function $constArrRaw_B(len, encoded) {
  return new $ac_B(new Int8Array($constArrayBuffer_B(len, encoded)));
}
function $constArrRaw_S(len, encoded) {
  return new $ac_S(new Int16Array($constArrayBuffer_S(len, encoded)));
}
function $constArrRaw_C(len, encoded) {
  return new $ac_C(new Uint16Array($constArrayBuffer_S(len, encoded)));
}
function $constArrRaw_I(len, encoded) {
  return new $ac_I(new Int32Array($constArrayBuffer_I(len, encoded)));
}
function $constArrRaw_J(len, encoded) {
  return new $ac_J(new Int32Array($constArrayBuffer_J(len, encoded)));
}
function $constArrUVals_I(len, encoded) {
  return new $ac_I($constTypedArrayU_I(len, encoded, 0));
}
function $constArrUDiffs_I(len, encoded) {
  return new $ac_I($constTypedArrayU_I(len, encoded, (-1)));
}
function $constArrSVals_I(len, encoded) {
  return new $ac_I($constTypedArrayS_I(len, encoded, 0));
}
function $constArrSDiffs_I(len, encoded) {
  return new $ac_I($constTypedArrayS_I(len, encoded, (-1)));
}
function $constArrUVals_J(len, encoded) {
  return new $ac_J($constTypedArrayU_I((len << 1), encoded, 0));
}
function $constArrUDiffs_J(len, encoded) {
  return new $ac_J($constTypedArrayU_I((len << 1), encoded, (-1)));
}
function $constArrSVals_J(len, encoded) {
  return new $ac_J($constTypedArrayS_I((len << 1), encoded, 0));
}
function $constArrSDiffs_J(len, encoded) {
  return new $ac_J($constTypedArrayS_I((len << 1), encoded, (-1)));
}
/** @constructor */
function $c_LAlleyHandle(world) {
  this.LAlleyHandle__f_world = null;
  this.LAlleyHandle__f_world = world;
}
$c_LAlleyHandle.prototype = new $h_O();
$c_LAlleyHandle.prototype.constructor = $c_LAlleyHandle;
/** @constructor */
function $h_LAlleyHandle() {
}
$h_LAlleyHandle.prototype = $c_LAlleyHandle.prototype;
$c_LAlleyHandle.prototype.state__sjs_js_Dynamic = (function() {
  var value = $n(this.LAlleyHandle__f_world).LWorld__f_time;
  var value$1 = $n(this.LAlleyHandle__f_world).LWorld__f_wx;
  var value$2 = $n(this.LAlleyHandle__f_world).LWorld__f_wy;
  var value$3 = $n(this.LAlleyHandle__f_world).LWorld__f_camY;
  var value$4 = $n(this.LAlleyHandle__f_world).LWorld__f_rain;
  var value$5 = $n(this.LAlleyHandle__f_world).LWorld__f_warmth;
  var value$6 = $n(this.LAlleyHandle__f_world).LWorld__f_coinsFound;
  var value$7 = $n(this.LAlleyHandle__f_world).LWorld__f_catMode;
  var value$8 = $n(this.LAlleyHandle__f_world).LWorld__f_foxMode;
  var value$9 = $n($n(this.LAlleyHandle__f_world).LWorld__f_sound).LSound__f_on;
  var value$10 = $n(this.LAlleyHandle__f_world).LWorld__f_walking;
  var value$11 = $n(this.LAlleyHandle__f_world).LWorld__f_windowLit;
  var value$12 = $n(this.LAlleyHandle__f_world).LWorld__f_doorLight;
  var $x_12 = $m_sr_ScalaRunTime$();
  var xs = $n(this.LAlleyHandle__f_world).LWorld__f_lanterns;
  var f = ((_$1$2) => {
    var _$1 = $as_LLantern(_$1$2);
    return $n(_$1).LLantern__f_warm;
  });
  $m_s_reflect_ManifestFactory$DoubleManifest$();
  var len = $n(xs).u.length;
  var ys = new $ac_D(len);
  if ((len > 0)) {
    var i = 0;
    if ((xs !== null)) {
      while ((i < len)) {
        var $x_1 = i;
        var x0 = $n(xs).get(i);
        ys.set($x_1, $uD(f(x0)));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_I)) {
      var x3 = $asArrayOf_I(xs, 1);
      while ((i < len)) {
        var $x_2 = i;
        var x0$1 = $n(x3).get(i);
        ys.set($x_2, $uD(f(x0$1)));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_D)) {
      var x4 = $asArrayOf_D(xs, 1);
      while ((i < len)) {
        var $x_3 = i;
        var x0$2 = $n(x4).get(i);
        ys.set($x_3, $uD(f(x0$2)));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_J)) {
      var x5 = $asArrayOf_J(xs, 1);
      while ((i < len)) {
        var $x_6 = i;
        var $x_4 = $n(x5).u;
        var $x_5 = $aJCheckGet($x_4, i);
        var x0$3_$_lo = $x_4[$x_5];
        var x0$3_$_hi = $x_4[(($x_5 + 1) | 0)];
        ys.set($x_6, $uD(f($bL(x0$3_$_lo, x0$3_$_hi))));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_F)) {
      var x6 = $asArrayOf_F(xs, 1);
      while ((i < len)) {
        var $x_7 = i;
        var x0$4 = $n(x6).get(i);
        ys.set($x_7, $uD(f(x0$4)));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_C)) {
      var x7 = $asArrayOf_C(xs, 1);
      while ((i < len)) {
        var $x_8 = i;
        var x0$5 = $n(x7).get(i);
        ys.set($x_8, $uD(f($bC(x0$5))));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_B)) {
      var x8 = $asArrayOf_B(xs, 1);
      while ((i < len)) {
        var $x_9 = i;
        var x0$6 = $n(x8).get(i);
        ys.set($x_9, $uD(f(x0$6)));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_S)) {
      var x9 = $asArrayOf_S(xs, 1);
      while ((i < len)) {
        var $x_10 = i;
        var x0$7 = $n(x9).get(i);
        ys.set($x_10, $uD(f(x0$7)));
        i = ((1 + i) | 0);
      }
    } else if ((xs instanceof $ac_Z)) {
      var x10 = $asArrayOf_Z(xs, 1);
      while ((i < len)) {
        var $x_11 = i;
        var x0$8 = $n(x10).get(i);
        ys.set($x_11, $uD(f(x0$8)));
        i = ((1 + i) | 0);
      }
    } else {
      throw new $c_s_MatchError(xs);
    }
  }
  var seq = $x_12.wrapDoubleArray__AD__sci_ArraySeq(ys);
  var _2 = [...$m_sjsr_Compat$().toJSVarArgsImpl__sci_Seq__sjs_js_Array(seq)];
  var $x_24 = $m_sr_ScalaRunTime$();
  var xs$1 = $n(this.LAlleyHandle__f_world).LWorld__f_lanterns;
  var f$1 = ((_$2$2) => {
    var _$2 = $as_LLantern(_$2$2);
    return $n(_$2).LLantern__f_steady;
  });
  $m_s_reflect_ManifestFactory$BooleanManifest$();
  var len$1 = $n(xs$1).u.length;
  var ys$1 = new $ac_Z(len$1);
  if ((len$1 > 0)) {
    var i$1 = 0;
    if ((xs$1 !== null)) {
      while ((i$1 < len$1)) {
        var $x_13 = i$1;
        var x0$9 = $n(xs$1).get(i$1);
        ys$1.set($x_13, $uZ(f$1(x0$9)));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_I)) {
      var x3$1 = $asArrayOf_I(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_14 = i$1;
        var x0$10 = $n(x3$1).get(i$1);
        ys$1.set($x_14, $uZ(f$1(x0$10)));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_D)) {
      var x4$1 = $asArrayOf_D(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_15 = i$1;
        var x0$11 = $n(x4$1).get(i$1);
        ys$1.set($x_15, $uZ(f$1(x0$11)));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_J)) {
      var x5$1 = $asArrayOf_J(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_18 = i$1;
        var $x_16 = $n(x5$1).u;
        var $x_17 = $aJCheckGet($x_16, i$1);
        var x0$12_$_lo = $x_16[$x_17];
        var x0$12_$_hi = $x_16[(($x_17 + 1) | 0)];
        ys$1.set($x_18, $uZ(f$1($bL(x0$12_$_lo, x0$12_$_hi))));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_F)) {
      var x6$1 = $asArrayOf_F(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_19 = i$1;
        var x0$13 = $n(x6$1).get(i$1);
        ys$1.set($x_19, $uZ(f$1(x0$13)));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_C)) {
      var x7$1 = $asArrayOf_C(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_20 = i$1;
        var x0$14 = $n(x7$1).get(i$1);
        ys$1.set($x_20, $uZ(f$1($bC(x0$14))));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_B)) {
      var x8$1 = $asArrayOf_B(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_21 = i$1;
        var x0$15 = $n(x8$1).get(i$1);
        ys$1.set($x_21, $uZ(f$1(x0$15)));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_S)) {
      var x9$1 = $asArrayOf_S(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_22 = i$1;
        var x0$16 = $n(x9$1).get(i$1);
        ys$1.set($x_22, $uZ(f$1(x0$16)));
        i$1 = ((1 + i$1) | 0);
      }
    } else if ((xs$1 instanceof $ac_Z)) {
      var x10$1 = $asArrayOf_Z(xs$1, 1);
      while ((i$1 < len$1)) {
        var $x_23 = i$1;
        var x0$17 = $n(x10$1).get(i$1);
        ys$1.set($x_23, $uZ(f$1(x0$17)));
        i$1 = ((1 + i$1) | 0);
      }
    } else {
      throw new $c_s_MatchError(xs$1);
    }
  }
  var seq$1 = $x_24.wrapBooleanArray__AZ__sci_ArraySeq(ys$1);
  var _2$1 = [...$m_sjsr_Compat$().toJSVarArgsImpl__sci_Seq__sjs_js_Array(seq$1)];
  var $x_36 = $m_sr_ScalaRunTime$();
  var xs$2 = $n(this.LAlleyHandle__f_world).LWorld__f_lanterns;
  var f$2 = ((_$3$2) => {
    var _$3 = $as_LLantern(_$3$2);
    return $n(_$3).LLantern__f_hue;
  });
  $m_s_reflect_ManifestFactory$DoubleManifest$();
  var len$2 = $n(xs$2).u.length;
  var ys$2 = new $ac_D(len$2);
  if ((len$2 > 0)) {
    var i$2 = 0;
    if ((xs$2 !== null)) {
      while ((i$2 < len$2)) {
        var $x_25 = i$2;
        var x0$18 = $n(xs$2).get(i$2);
        ys$2.set($x_25, $uD(f$2(x0$18)));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_I)) {
      var x3$2 = $asArrayOf_I(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_26 = i$2;
        var x0$19 = $n(x3$2).get(i$2);
        ys$2.set($x_26, $uD(f$2(x0$19)));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_D)) {
      var x4$2 = $asArrayOf_D(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_27 = i$2;
        var x0$20 = $n(x4$2).get(i$2);
        ys$2.set($x_27, $uD(f$2(x0$20)));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_J)) {
      var x5$2 = $asArrayOf_J(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_30 = i$2;
        var $x_28 = $n(x5$2).u;
        var $x_29 = $aJCheckGet($x_28, i$2);
        var x0$21_$_lo = $x_28[$x_29];
        var x0$21_$_hi = $x_28[(($x_29 + 1) | 0)];
        ys$2.set($x_30, $uD(f$2($bL(x0$21_$_lo, x0$21_$_hi))));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_F)) {
      var x6$2 = $asArrayOf_F(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_31 = i$2;
        var x0$22 = $n(x6$2).get(i$2);
        ys$2.set($x_31, $uD(f$2(x0$22)));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_C)) {
      var x7$2 = $asArrayOf_C(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_32 = i$2;
        var x0$23 = $n(x7$2).get(i$2);
        ys$2.set($x_32, $uD(f$2($bC(x0$23))));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_B)) {
      var x8$2 = $asArrayOf_B(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_33 = i$2;
        var x0$24 = $n(x8$2).get(i$2);
        ys$2.set($x_33, $uD(f$2(x0$24)));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_S)) {
      var x9$2 = $asArrayOf_S(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_34 = i$2;
        var x0$25 = $n(x9$2).get(i$2);
        ys$2.set($x_34, $uD(f$2(x0$25)));
        i$2 = ((1 + i$2) | 0);
      }
    } else if ((xs$2 instanceof $ac_Z)) {
      var x10$2 = $asArrayOf_Z(xs$2, 1);
      while ((i$2 < len$2)) {
        var $x_35 = i$2;
        var x0$26 = $n(x10$2).get(i$2);
        ys$2.set($x_35, $uD(f$2(x0$26)));
        i$2 = ((1 + i$2) | 0);
      }
    } else {
      throw new $c_s_MatchError(xs$2);
    }
  }
  var seq$2 = $x_36.wrapDoubleArray__AD__sci_ArraySeq(ys$2);
  var _2$2 = [...$m_sjsr_Compat$().toJSVarArgsImpl__sci_Seq__sjs_js_Array(seq$2)];
  var $x_37 = $m_sr_ScalaRunTime$();
  var xs$3 = $n(this.LAlleyHandle__f_world).LWorld__f_lanterns;
  $m_s_reflect_ManifestFactory$DoubleManifest$();
  var capacity = 0;
  var size = 0;
  var jsElems = null;
  capacity = 0;
  size = 0;
  jsElems = [];
  var i$3 = 0;
  while ((i$3 < $n(xs$3).u.length)) {
    var x1 = i$3;
    var x0$27 = $n(xs$3).get(x1);
    var elems = new $c_sci_$colon$colon($n(x0$27).LLantern__f_x, new $c_sci_$colon$colon($n(x0$27).LLantern__f_y, $m_sci_Nil$()));
    var it = new $c_sc_StrictOptimizedLinearSeqOps$$anon$1(elems);
    while (it.hasNext__Z()) {
      var elem = it.next__O();
      var unboxedElem = ((elem === null) ? $m_scm_ArrayBuilder$().scala$collection$mutable$ArrayBuilder$$$zeroOf__jl_Class__O($d_D.getClassOf()) : elem);
      jsElems.push(unboxedElem);
    }
    i$3 = ((1 + i$3) | 0);
  }
  var seq$3 = $x_37.wrapDoubleArray__AD__sci_ArraySeq($asArrayOf_D($m_scm_ArrayBuilder$().scala$collection$mutable$ArrayBuilder$$$genericArrayBuilderResult__jl_Class__sjs_js_Array__O($d_D.getClassOf(), jsElems), 1));
  var _2$3 = [...$m_sjsr_Compat$().toJSVarArgsImpl__sci_Seq__sjs_js_Array(seq$3)];
  var $x_38 = $m_sr_ScalaRunTime$();
  var xs$4 = $n(this.LAlleyHandle__f_world).LWorld__f_coins;
  $m_s_reflect_ManifestFactory$DoubleManifest$();
  var capacity$1 = 0;
  var size$1 = 0;
  var jsElems$1 = null;
  capacity$1 = 0;
  size$1 = 0;
  jsElems$1 = [];
  var i$4 = 0;
  while ((i$4 < $n(xs$4).u.length)) {
    var x1$1 = i$4;
    var x0$28 = $n(xs$4).get(x1$1);
    var elems$1 = new $c_sci_$colon$colon($n(x0$28).LCoin__f_x, new $c_sci_$colon$colon($n(x0$28).LCoin__f_y, $m_sci_Nil$()));
    var it$1 = new $c_sc_StrictOptimizedLinearSeqOps$$anon$1(elems$1);
    while (it$1.hasNext__Z()) {
      var elem$1 = it$1.next__O();
      var unboxedElem$1 = ((elem$1 === null) ? $m_scm_ArrayBuilder$().scala$collection$mutable$ArrayBuilder$$$zeroOf__jl_Class__O($d_D.getClassOf()) : elem$1);
      jsElems$1.push(unboxedElem$1);
    }
    i$4 = ((1 + i$4) | 0);
  }
  var seq$4 = $x_38.wrapDoubleArray__AD__sci_ArraySeq($asArrayOf_D($m_scm_ArrayBuilder$().scala$collection$mutable$ArrayBuilder$$$genericArrayBuilderResult__jl_Class__sjs_js_Array__O($d_D.getClassOf(), jsElems$1), 1));
  var _2$4 = [...$m_sjsr_Compat$().toJSVarArgsImpl__sci_Seq__sjs_js_Array(seq$4)];
  var _2$5 = [$n(this.LAlleyHandle__f_world).LWorld__f_wellX, $n(this.LAlleyHandle__f_world).LWorld__f_wellY];
  return ({
    "time": value,
    "wx": value$1,
    "wy": value$2,
    "camY": value$3,
    "rain": value$4,
    "warmth": value$5,
    "coins": value$6,
    "cat": value$7,
    "fox": value$8,
    "sound": value$9,
    "walking": value$10,
    "window": value$11,
    "door": value$12,
    "warm": _2,
    "steady": _2$1,
    "hue": _2$2,
    "lanterns": _2$3,
    "coinsAt": _2$4,
    "well": _2$5
  });
});
$c_LAlleyHandle.prototype.audio__T = (function() {
  return $n($n(this.LAlleyHandle__f_world).LWorld__f_sound).state__T();
});
$c_LAlleyHandle.prototype.lanternCount__I = (function() {
  return $n($n(this.LAlleyHandle__f_world).LWorld__f_lanterns).u.length;
});
$c_LAlleyHandle.prototype.place__D__D__V = (function(x, y) {
  $n(this.LAlleyHandle__f_world).LWorld__f_wx = x;
  $n(this.LAlleyHandle__f_world).LWorld__f_wy = y;
  $n(this.LAlleyHandle__f_world).LWorld__f_tx = x;
  $n(this.LAlleyHandle__f_world).LWorld__f_ty = y;
});
$c_LAlleyHandle.prototype.standStill__V = (function() {
  $n(this.LAlleyHandle__f_world).LWorld__f_tx = $n(this.LAlleyHandle__f_world).LWorld__f_wx;
  $n(this.LAlleyHandle__f_world).LWorld__f_ty = $n(this.LAlleyHandle__f_world).LWorld__f_wy;
  $n(this.LAlleyHandle__f_world).LWorld__f_idleT = 60.0;
  $n(this.LAlleyHandle__f_world).LWorld__f_catCooldown = 0.0;
  $n(this.LAlleyHandle__f_world).LWorld__f_foxCooldown = 0.0;
});
$c_LAlleyHandle.prototype.setRain__D__V = (function(v) {
  if ((v > 0.0)) {
    $n(this.LAlleyHandle__f_world).LWorld__f_rainHold = 60.0;
  } else {
    $n(this.LAlleyHandle__f_world).LWorld__f_rainHold = 0.0;
  }
});
$c_LAlleyHandle.prototype.windowAt__sjs_js_Array = (function() {
  return [$n(this.LAlleyHandle__f_world).LWorld__f_windowX, $n(this.LAlleyHandle__f_world).LWorld__f_windowY];
});
$c_LAlleyHandle.prototype.doorAt__sjs_js_Array = (function() {
  return [$n(this.LAlleyHandle__f_world).LWorld__f_doorX, $n(this.LAlleyHandle__f_world).LWorld__f_doorY];
});
$c_LAlleyHandle.prototype.whoosh = (function(arg) {
  var prep0 = $uD(arg);
  $n(this.LAlleyHandle__f_world).gust__D__V(prep0);
});
$c_LAlleyHandle.prototype.tendLantern = (function(arg) {
  var prep0 = $uI(arg);
  $n(this.LAlleyHandle__f_world).tendLantern__I__V(prep0);
});
$c_LAlleyHandle.prototype.setRain = (function(arg) {
  var prep0 = $uD(arg);
  this.setRain__D__V(prep0);
});
$c_LAlleyHandle.prototype.windowAt = (function() {
  return this.windowAt__sjs_js_Array();
});
$c_LAlleyHandle.prototype.warmLantern = (function(arg) {
  var prep0 = $uI(arg);
  $n(this.LAlleyHandle__f_world).warmLantern__I__V(prep0);
});
$c_LAlleyHandle.prototype.lanternCount = (function() {
  return this.lanternCount__I();
});
$c_LAlleyHandle.prototype.audio = (function() {
  return this.audio__T();
});
$c_LAlleyHandle.prototype.place = (function(arg, arg$2) {
  var prep0 = $uD(arg);
  var prep1 = $uD(arg$2);
  this.place__D__D__V(prep0, prep1);
});
$c_LAlleyHandle.prototype.state = (function() {
  return this.state__sjs_js_Dynamic();
});
$c_LAlleyHandle.prototype.standStill = (function() {
  this.standStill__V();
});
$c_LAlleyHandle.prototype.doorAt = (function() {
  return this.doorAt__sjs_js_Array();
});
$c_LAlleyHandle.prototype.lightAt = (function(arg, arg$2) {
  var prep0 = $uD(arg);
  var prep1 = $uD(arg$2);
  return $n(this.LAlleyHandle__f_world).lightAt__D__D__D(prep0, prep1);
});
var $d_LAlleyHandle = new $TypeData().initClass($c_LAlleyHandle, "AlleyHandle", ({
  LAlleyHandle: 1
}));
/** @constructor */
function $c_LCoin(x, y) {
  this.LCoin__f_x = 0.0;
  this.LCoin__f_y = 0.0;
  this.LCoin__f_found = false;
  this.LCoin__f_bob = 0.0;
  this.LCoin__f_x = x;
  this.LCoin__f_y = y;
  this.LCoin__f_found = false;
  this.LCoin__f_bob = 0.0;
}
$c_LCoin.prototype = new $h_O();
$c_LCoin.prototype.constructor = $c_LCoin;
/** @constructor */
function $h_LCoin() {
}
$h_LCoin.prototype = $c_LCoin.prototype;
var $d_LCoin = new $TypeData().initClass($c_LCoin, "Coin", ({
  LCoin: 1
}));
/** @constructor */
function $c_LLantern(x, y) {
  this.LLantern__f_x = 0.0;
  this.LLantern__f_y = 0.0;
  this.LLantern__f_warm = 0.0;
  this.LLantern__f_steady = false;
  this.LLantern__f_hue = 0.0;
  this.LLantern__f_sway = 0.0;
  this.LLantern__f_swayV = 0.0;
  this.LLantern__f_flick = 0.0;
  this.LLantern__f_x = x;
  this.LLantern__f_y = y;
  this.LLantern__f_warm = 0.0;
  this.LLantern__f_steady = false;
  this.LLantern__f_hue = 0.0;
  this.LLantern__f_sway = 0.0;
  this.LLantern__f_swayV = 0.0;
  this.LLantern__f_flick = 0.0;
}
$c_LLantern.prototype = new $h_O();
$c_LLantern.prototype.constructor = $c_LLantern;
/** @constructor */
function $h_LLantern() {
}
$h_LLantern.prototype = $c_LLantern.prototype;
function $as_LLantern(obj) {
  return (((obj instanceof $c_LLantern) || (obj === null)) ? obj : $throwClassCastException(obj, "Lantern"));
}
function $isArrayOf_LLantern(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LLantern)));
}
function $asArrayOf_LLantern(obj, depth) {
  return (($isArrayOf_LLantern(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "LLantern;", depth));
}
var $d_LLantern = new $TypeData().initClass($c_LLantern, "Lantern", ({
  LLantern: 1
}));
function $p_LLighting__rgb__D__D__D__T($thiz, r, g, b) {
  return (((((("rgb(" + $p_LLighting__clamp__D__I($thiz, r)) + ",") + $p_LLighting__clamp__D__I($thiz, g)) + ",") + $p_LLighting__clamp__D__I($thiz, b)) + ")");
}
function $p_LLighting__clamp__D__I($thiz, v) {
  var y = $doubleToInt(v);
  var y$1 = ((y > 255) ? 255 : y);
  return ((y$1 < 0) ? 0 : y$1);
}
function $p_LLighting__fmt__D__T($thiz, v) {
  var x = (1000.0 * v);
  var value = $uD(Math.round(x));
  var $x_1 = $m_RTLong$().fromDouble__D__J(value);
  var x$1_$_lo = $x_1.l;
  var x$1_$_hi = $x_1.h;
  var this$6 = (((4.294967296E9 * x$1_$_hi) + (x$1_$_lo >>> 0.0)) / 1000.0);
  var s = ("" + this$6);
  return s;
}
/** @constructor */
function $c_LLighting(w, h) {
  this.LLighting__f_w = 0;
  this.LLighting__f_h = 0;
  this.LLighting__f_canvas = null;
  this.LLighting__f_ctx = null;
  this.LLighting__f_w = w;
  this.LLighting__f_h = h;
  this.LLighting__f_canvas = document.createElement("canvas");
  this.LLighting__f_canvas.width = w;
  this.LLighting__f_canvas.height = h;
  this.LLighting__f_ctx = this.LLighting__f_canvas.getContext("2d");
}
$c_LLighting.prototype = new $h_O();
$c_LLighting.prototype.constructor = $c_LLighting;
/** @constructor */
function $h_LLighting() {
}
$h_LLighting.prototype = $c_LLighting.prototype;
$c_LLighting.prototype.begin__D__D__D__V = (function(r, g, b) {
  this.LLighting__f_ctx.globalCompositeOperation = "source-over";
  var $x_1 = this.LLighting__f_ctx;
  var s = $p_LLighting__rgb__D__D__D__T(this, r, g, b);
  $x_1.fillStyle = s;
  var $x_2 = this.LLighting__f_ctx;
  var value = this.LLighting__f_w;
  var value$1 = this.LLighting__f_h;
  $x_2.fillRect(0, 0, value, value$1);
  this.LLighting__f_ctx.globalCompositeOperation = "lighter";
});
$c_LLighting.prototype.add__D__D__D__D__D__D__D__V = (function(x, y, radius, cr, cg, cb, a) {
  if (((a <= 0.01) || (radius <= 0.1))) {
    return (void 0);
  }
  if (((((x < (-radius)) || (x > (this.LLighting__f_w + radius))) || (y < (-radius))) || (y > (this.LLighting__f_h + radius)))) {
    return (void 0);
  }
  var grad = this.LLighting__f_ctx.createRadialGradient(x, y, 0.0, x, y, radius);
  var s = (((((((("rgba(" + $p_LLighting__clamp__D__I(this, cr)) + ",") + $p_LLighting__clamp__D__I(this, cg)) + ",") + $p_LLighting__clamp__D__I(this, cb)) + ",") + $p_LLighting__fmt__D__T(this, a)) + ")");
  grad.addColorStop(0.0, s);
  var s$1 = (((((((("rgba(" + $p_LLighting__clamp__D__I(this, cr)) + ",") + $p_LLighting__clamp__D__I(this, cg)) + ",") + $p_LLighting__clamp__D__I(this, cb)) + ",") + $p_LLighting__fmt__D__T(this, (0.45 * a))) + ")");
  grad.addColorStop(0.4, s$1);
  grad.addColorStop(1.0, "rgba(0,0,0,0)");
  this.LLighting__f_ctx.fillStyle = grad;
  this.LLighting__f_ctx.beginPath();
  this.LLighting__f_ctx.arc(x, y, radius, 0.0, 6.283185307179586);
  this.LLighting__f_ctx.fill();
});
$c_LLighting.prototype.finish__sjs_js_Dynamic__V = (function(target) {
  target.globalCompositeOperation = "multiply";
  target.drawImage(this.LLighting__f_canvas, 0, 0);
  target.globalCompositeOperation = "source-over";
});
var $d_LLighting = new $TypeData().initClass($c_LLighting, "Lighting", ({
  LLighting: 1
}));
function $s_LMain__main__AT__V(args) {
  $m_LMain$().main__AT__V(args);
}
function $p_LMain$__fit$1__sjs_js_Dynamic__LWorld__sjs_js_Dynamic__V($thiz, win$1, world$1, canvas$1) {
  var ww = $uD(win$1.innerWidth);
  var wh = $uD(win$1.innerHeight);
  var x = (ww / $n(world$1).LWorld__f_VIEW_W);
  var y = (wh / $n(world$1).LWorld__f_VIEW_H);
  var sc = $uD(Math.min(x, y));
  var $x_1 = canvas$1.style;
  var y$1 = $doubleToInt(($n(world$1).LWorld__f_VIEW_W * sc));
  var this$5 = ((y$1 < 1) ? 1 : y$1);
  var s = (("" + this$5) + "px");
  $x_1.width = s;
  var $x_2 = canvas$1.style;
  var y$2 = $doubleToInt(($n(world$1).LWorld__f_VIEW_H * sc));
  var this$10 = ((y$2 < 1) ? 1 : y$2);
  var s$1 = (("" + this$10) + "px");
  $x_2.height = s$1;
}
function $p_LMain$__load$1__T($thiz) {
  try {
    var v = localStorage.getItem("lantern-alley-sound");
    return ((v === null) ? "off" : $dp_toString__T($n(v)));
  } catch (e) {
    return "off";
  }
}
function $p_LMain$__save$1__T__V($thiz, v) {
  try {
    localStorage.setItem("lantern-alley-sound", v);
  } catch (e) {
  }
}
function $p_LMain$__paint$1__LSound__sjs_js_Dynamic__sjs_js_Dynamic__V($thiz, sound$1, btn$1, label$1) {
  var st = ($n(sound$1).LSound__f_on ? "true" : "false");
  btn$1.setAttribute("data-on", st);
  btn$1.setAttribute("aria-pressed", st);
  btn$1.setAttribute("aria-label", ($n(sound$1).LSound__f_on ? "Sound on" : "Sound off"));
  label$1.textContent = ($n(sound$1).LSound__f_on ? "Sound on" : "Sound off");
}
function $p_LMain$__logical$1__sjs_js_Dynamic__LWorld__D__D__T2($thiz, canvas$2, world$2, clientX, clientY) {
  var r = canvas$2.getBoundingClientRect();
  var y = ($uD(r.width) / $n(world$2).LWorld__f_VIEW_W);
  var sc = $uD(Math.max(1.0E-4, y));
  var _1 = ((clientX - $uD(r.left)) / sc);
  var _2 = ((clientY - $uD(r.top)) / sc);
  return new $c_T2(_1, _2);
}
function $p_LMain$__worldPoint$1__LWorld__sjs_js_Dynamic__D__D__T2($thiz, world$3, canvas$3, clientX, clientY) {
  matchResult1: {
    var \u03b42$;
    var x1 = $p_LMain$__logical$1__sjs_js_Dynamic__LWorld__D__D__T2($thiz, canvas$3, world$3, clientX, clientY);
    if ((x1 !== null)) {
      $n(x1)._1$mcD$sp__D();
      $n(x1)._2$mcD$sp__D();
      var \u03b42$ = x1;
      break matchResult1;
    }
    throw new $c_s_MatchError(x1);
  }
  var lx$2 = $n(\u03b42$)._1$mcD$sp__D();
  var ly$2 = $n(\u03b42$)._2$mcD$sp__D();
  var _2 = ($n(world$3).LWorld__f_camY + ly$2);
  return new $c_T2(lx$2, _2);
}
/** @constructor */
function $c_LMain$() {
}
$c_LMain$.prototype = new $h_O();
$c_LMain$.prototype.constructor = $c_LMain$;
/** @constructor */
function $h_LMain$() {
}
$h_LMain$.prototype = $c_LMain$.prototype;
$c_LMain$.prototype.main__AT__V = (function(args) {
  var doc = document;
  var win = window;
  var canvas = doc.getElementById("c");
  var ctx = canvas.getContext("2d");
  var sound = new $c_LSound();
  var world = new $c_LWorld(sound);
  var value = world.LWorld__f_VIEW_W;
  canvas.width = value;
  var value$1 = world.LWorld__f_VIEW_H;
  canvas.height = value$1;
  win.alley = new $c_LAlleyHandle(world);
  $p_LMain$__fit$1__sjs_js_Dynamic__LWorld__sjs_js_Dynamic__V(this, win, world, canvas);
  var btn = doc.getElementById("sound");
  var label = btn.querySelector(".label");
  var elem = ($p_LMain$__load$1__T(this) === "on");
  var wantOn = new $c_sr_BooleanRef(elem);
  $p_LMain$__paint$1__LSound__sjs_js_Dynamic__sjs_js_Dynamic__V(this, sound, btn, label);
  var onClick = ((e$3) => {
    e$3.preventDefault();
    e$3.stopPropagation();
    if (sound.LSound__f_on) {
      sound.mute__V();
      $p_LMain$__save$1__T__V(this, "off");
    } else {
      sound.unmute__V();
      $p_LMain$__save$1__T__V(this, "on");
    }
    $p_LMain$__paint$1__LSound__sjs_js_Dynamic__sjs_js_Dynamic__V(this, sound, btn, label);
  });
  btn.addEventListener("click", onClick);
  var downX = new $c_sr_DoubleRef(0.0);
  var downY = new $c_sr_DoubleRef(0.0);
  var downT = new $c_sr_DoubleRef(0.0);
  var mode = new $c_sr_IntRef(0);
  var held = new $c_sr_IntRef(0);
  var onDown = ((e$3$1) => {
    if ((!$uZ(btn.contains(e$3$1.target)))) {
      if ((wantOn.sr_BooleanRef__f_elem && (!sound.LSound__f_on))) {
        sound.unmute__V();
        $p_LMain$__paint$1__LSound__sjs_js_Dynamic__sjs_js_Dynamic__V(this, sound, btn, label);
      }
      sound.resumeIfOn__V();
      downX.sr_DoubleRef__f_elem = $uD(e$3$1.clientX);
      downY.sr_DoubleRef__f_elem = $uD(e$3$1.clientY);
      downT.sr_DoubleRef__f_elem = $uD(Date.now());
      mode.sr_IntRef__f_elem = 0;
      held.sr_IntRef__f_elem = 1;
      world.LWorld__f_inputT = 0.0;
    }
  });
  var onMove = ((e$3$2) => {
    if (((held.sr_IntRef__f_elem === 1) && (!$uZ(btn.contains(e$3$2.target))))) {
      var dx = ($uD(e$3$2.clientX) - downX.sr_DoubleRef__f_elem);
      var dy = ($uD(e$3$2.clientY) - downY.sr_DoubleRef__f_elem);
      if (((mode.sr_IntRef__f_elem === 0) && (($uD(Math.abs(dx)) + $uD(Math.abs(dy))) > 7.0))) {
        mode.sr_IntRef__f_elem = 1;
      }
      if ((mode.sr_IntRef__f_elem === 1)) {
        matchResult2: {
          var \u03b44$;
          var x4 = $p_LMain$__worldPoint$1__LWorld__sjs_js_Dynamic__D__D__T2(this, world, canvas, $uD(e$3$2.clientX), $uD(e$3$2.clientY));
          if ((x4 !== null)) {
            $n(x4)._1$mcD$sp__D();
            $n(x4)._2$mcD$sp__D();
            var \u03b44$ = x4;
            break matchResult2;
          }
          throw new $c_s_MatchError(x4);
        }
        var wx$2 = $n(\u03b44$)._1$mcD$sp__D();
        var wy$2 = $n(\u03b44$)._2$mcD$sp__D();
        world.dragTo__D__D__V(wx$2, wy$2);
      }
    }
  });
  var onUp = ((e$3$3) => {
    if ((held.sr_IntRef__f_elem === 1)) {
      var now = $uD(Date.now());
      var dx$1 = ($uD(e$3$3.clientX) - downX.sr_DoubleRef__f_elem);
      var dy$1 = ($uD(e$3$3.clientY) - downY.sr_DoubleRef__f_elem);
      var dist = $m_jl_Math$().hypot__D__D__D(dx$1, dy$1);
      var dur = (now - downT.sr_DoubleRef__f_elem);
      if (((dur < 340.0) && (dist > 42.0))) {
        world.gust__D__V(((dx$1 >= 0.0) ? 1.0 : (-1.0)));
      } else if ((mode.sr_IntRef__f_elem === 0)) {
        if ((dist < 15.0)) {
          matchResult3: {
            var \u03b46$;
            var x7 = $p_LMain$__worldPoint$1__LWorld__sjs_js_Dynamic__D__D__T2(this, world, canvas, $uD(e$3$3.clientX), $uD(e$3$3.clientY));
            if ((x7 !== null)) {
              $n(x7)._1$mcD$sp__D();
              $n(x7)._2$mcD$sp__D();
              var \u03b46$ = x7;
              break matchResult3;
            }
            throw new $c_s_MatchError(x7);
          }
          var wx$2$1 = $n(\u03b46$)._1$mcD$sp__D();
          var wy$2$1 = $n(\u03b46$)._2$mcD$sp__D();
          world.tapAt__D__D__V(wx$2$1, wy$2$1);
        }
      }
      held.sr_IntRef__f_elem = 0;
      mode.sr_IntRef__f_elem = (-1);
    }
  });
  var onCancel = ((_$1$3) => {
    held.sr_IntRef__f_elem = 0;
    mode.sr_IntRef__f_elem = (-1);
  });
  var noContext = ((e$3$4) => {
    e$3$4.preventDefault();
  });
  var onResize = ((_$2$3) => {
    $p_LMain$__fit$1__sjs_js_Dynamic__LWorld__sjs_js_Dynamic__V(this, win, world, canvas);
  });
  var onVisible = ((_$3$3) => {
    if (($as_T(doc.visibilityState) === "visible")) {
      sound.resumeIfOn__V();
    }
  });
  win.addEventListener("pointerdown", onDown);
  win.addEventListener("pointermove", onMove);
  win.addEventListener("pointerup", onUp);
  win.addEventListener("pointercancel", onCancel);
  win.addEventListener("resize", onResize);
  doc.addEventListener("contextmenu", noContext);
  doc.addEventListener("visibilitychange", onVisible);
  doc.addEventListener("gesturestart", noContext);
  var loading = doc.getElementById("loading");
  loading.style.display = "none";
  var elem$1 = $uD(Date.now());
  var last = new $c_sr_DoubleRef(elem$1);
  var frameRef = new $c_sr_ObjectRef(null);
  var frame = ((arg1$2) => {
    $uD(arg1$2);
    var now$1 = $uD(Date.now());
    var dt = ((now$1 - last.sr_DoubleRef__f_elem) / 1000.0);
    last.sr_DoubleRef__f_elem = now$1;
    if ((dt > 0.08)) {
      dt = 0.08;
    }
    if ((dt < 0.0)) {
      dt = 0.0;
    }
    if ((((held.sr_IntRef__f_elem === 1) && (mode.sr_IntRef__f_elem === 0)) && ((now$1 - downT.sr_DoubleRef__f_elem) > 430.0))) {
      mode.sr_IntRef__f_elem = 2;
      matchResult4: {
        var \u03b48$;
        var x10 = $p_LMain$__worldPoint$1__LWorld__sjs_js_Dynamic__D__D__T2(this, world, canvas, downX.sr_DoubleRef__f_elem, downY.sr_DoubleRef__f_elem);
        if ((x10 !== null)) {
          $n(x10)._1$mcD$sp__D();
          $n(x10)._2$mcD$sp__D();
          var \u03b48$ = x10;
          break matchResult4;
        }
        throw new $c_s_MatchError(x10);
      }
      var wx$2$2 = $n(\u03b48$)._1$mcD$sp__D();
      var wy$2$2 = $n(\u03b48$)._2$mcD$sp__D();
      world.longPressAt__D__D__V(wx$2$2, wy$2$2);
    }
    world.update__D__V(dt);
    $n(world.LWorld__f_render).draw__sjs_js_Dynamic__V(ctx);
    requestAnimationFrame(frameRef.sr_ObjectRef__f_elem);
  });
  frameRef.sr_ObjectRef__f_elem = frame;
  requestAnimationFrame(frame);
});
var $d_LMain$ = new $TypeData().initClass($c_LMain$, "Main$", ({
  LMain$: 1
}));
var $n_LMain$;
function $m_LMain$() {
  if ((!$n_LMain$)) {
    $n_LMain$ = new $c_LMain$();
  }
  return $n_LMain$;
}
/** @constructor */
function $c_LP(x, y, vx, vy, life, max, kind, size) {
  this.LP__f_x = 0.0;
  this.LP__f_y = 0.0;
  this.LP__f_vx = 0.0;
  this.LP__f_vy = 0.0;
  this.LP__f_life = 0.0;
  this.LP__f_max = 0.0;
  this.LP__f_kind = 0;
  this.LP__f_size = 0.0;
  this.LP__f_x = x;
  this.LP__f_y = y;
  this.LP__f_vx = vx;
  this.LP__f_vy = vy;
  this.LP__f_life = life;
  this.LP__f_max = max;
  this.LP__f_kind = kind;
  this.LP__f_size = size;
}
$c_LP.prototype = new $h_O();
$c_LP.prototype.constructor = $c_LP;
/** @constructor */
function $h_LP() {
}
$h_LP.prototype = $c_LP.prototype;
function $as_LP(obj) {
  return (((obj instanceof $c_LP) || (obj === null)) ? obj : $throwClassCastException(obj, "P"));
}
function $isArrayOf_LP(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.LP)));
}
function $asArrayOf_LP(obj, depth) {
  return (($isArrayOf_LP(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "LP;", depth));
}
var $d_LP = new $TypeData().initClass($c_LP, "P", ({
  LP: 1
}));
function $p_LRender__build__V($thiz) {
  if (($thiz.LRender__f_stat !== null)) {
    return (void 0);
  }
  var c = $thiz.LRender__f_doc.createElement("canvas");
  var value = $n($thiz.LRender__f_world).LWorld__f_W;
  c.width = value;
  var value$1 = $n($thiz.LRender__f_world).LWorld__f_H;
  c.height = value$1;
  var g = c.getContext("2d");
  var elem_$_lo = 0;
  var elem_$_hi = 0;
  elem_$_lo = 20261111;
  elem_$_hi = 0;
  var y = 0;
  while ((y < 42)) {
    var t = (y / 42.0);
    var cr = $doubleToInt((17.0 + (27.0 * t)));
    var cg = $doubleToInt((23.0 + (31.0 * t)));
    var cb = $doubleToInt((46.0 + (46.0 * t)));
    var x = y;
    var x$1 = $n($thiz.LRender__f_world).LWorld__f_W;
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 0.0, x, x$1, 1.0, (((((("rgb(" + cr) + ",") + cg) + ",") + cb) + ")"));
    y = ((1 + y) | 0);
  }
  var i = 0;
  while ((i < 30)) {
    var x$2_$_lo = elem_$_lo;
    var x$2_$_hi = elem_$_hi;
    var b0 = (65535 & x$2_$_lo);
    var b1 = ((x$2_$_lo >>> 16) | 0);
    var a0b0 = Math.imul(20077, b0);
    var a1b0 = Math.imul(16838, b0);
    var a0b1 = Math.imul(20077, b1);
    var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
    var lo$1 = ((12345 + lo) | 0);
    var lo$2 = (2147483647 & lo$1);
    elem_$_lo = lo$2;
    elem_$_hi = 0;
    var x$3_$_lo = elem_$_lo;
    var x$3_$_hi = elem_$_hi;
    var sx = $doubleToInt(((((4.294967296E9 * x$3_$_hi) + (x$3_$_lo >>> 0.0)) / 2.147483647E9) * $n($thiz.LRender__f_world).LWorld__f_W));
    var x$4_$_lo = elem_$_lo;
    var x$4_$_hi = elem_$_hi;
    var b0$1 = (65535 & x$4_$_lo);
    var b1$1 = ((x$4_$_lo >>> 16) | 0);
    var a0b0$1 = Math.imul(20077, b0$1);
    var a1b0$1 = Math.imul(16838, b0$1);
    var a0b1$1 = Math.imul(20077, b1$1);
    var lo$3 = ((a0b0$1 + (((a1b0$1 + a0b1$1) | 0) << 16)) | 0);
    var lo$4 = ((12345 + lo$3) | 0);
    var lo$5 = (2147483647 & lo$4);
    elem_$_lo = lo$5;
    elem_$_hi = 0;
    var x$5_$_lo = elem_$_lo;
    var x$5_$_hi = elem_$_hi;
    var sy = $doubleToInt((36.0 * (((4.294967296E9 * x$5_$_hi) + (x$5_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$6_$_lo = elem_$_lo;
    var x$6_$_hi = elem_$_hi;
    var b0$2 = (65535 & x$6_$_lo);
    var b1$2 = ((x$6_$_lo >>> 16) | 0);
    var a0b0$2 = Math.imul(20077, b0$2);
    var a1b0$2 = Math.imul(16838, b0$2);
    var a0b1$2 = Math.imul(20077, b1$2);
    var lo$6 = ((a0b0$2 + (((a1b0$2 + a0b1$2) | 0) << 16)) | 0);
    var lo$7 = ((12345 + lo$6) | 0);
    var lo$8 = (2147483647 & lo$7);
    elem_$_lo = lo$8;
    elem_$_hi = 0;
    var x$7_$_lo = elem_$_lo;
    var x$7_$_hi = elem_$_hi;
    if (((((4.294967296E9 * x$7_$_hi) + (x$7_$_lo >>> 0.0)) / 2.147483647E9) < 0.25)) {
      var col = "#cfd6ee";
    } else {
      var col = "#8f98bd";
    }
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, sx, sy, 1.0, 1.0, col);
    i = ((1 + i) | 0);
  }
  var halo = g.createRadialGradient(31.0, 15.0, 2.0, 31.0, 15.0, 22.0);
  halo.addColorStop(0.0, "rgba(226,228,205,0.35)");
  halo.addColorStop(1.0, "rgba(226,228,205,0)");
  g.fillStyle = halo;
  g.beginPath();
  g.arc(31.0, 15.0, 22.0, 0.0, 6.283185307);
  g.fill();
  g.fillStyle = "#e9e6d4";
  g.beginPath();
  g.arc(31.0, 15.0, 6.0, 0.0, 6.283185307);
  g.fill();
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 29.0, 12.0, 1.0, 1.0, "#d3d0bc");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 33.0, 17.0, 1.0, 1.0, "#d3d0bc");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 31.0, 16.0, 1.0, 1.0, "#dbd8c4");
  var row = 0;
  var y$1 = 42.0;
  while ((y$1 < 60.0)) {
    var num = row;
    var t$1 = ((num >>> 31) | 0);
    if (((((1 & ((num + t$1) | 0)) - t$1) | 0) === 0)) {
      var off = 0.0;
    } else {
      var off = 7.0;
    }
    var x$8 = ((-14.0) + off);
    while ((x$8 < 112.0)) {
      var y$2 = x$8;
      var l = $uD(Math.max(0.0, y$2));
      var x$9 = ((x$8 + 14.0) - 1.0);
      var r = $uD(Math.min(x$9, 112.0));
      var x$10 = ((y$1 + 6.0) - 1.0);
      var b = $uD(Math.min(x$10, 60.0));
      if (((r > l) && (b > y$1))) {
        var x$11_$_lo = elem_$_lo;
        var x$11_$_hi = elem_$_hi;
        var b0$3 = (65535 & x$11_$_lo);
        var b1$3 = ((x$11_$_lo >>> 16) | 0);
        var a0b0$3 = Math.imul(20077, b0$3);
        var a1b0$3 = Math.imul(16838, b0$3);
        var a0b1$3 = Math.imul(20077, b1$3);
        var lo$9 = ((a0b0$3 + (((a1b0$3 + a0b1$3) | 0) << 16)) | 0);
        var lo$10 = ((12345 + lo$9) | 0);
        var lo$11 = (2147483647 & lo$10);
        elem_$_lo = lo$11;
        elem_$_hi = 0;
        var x$12_$_lo = elem_$_lo;
        var x$12_$_hi = elem_$_hi;
        var q = (((4.294967296E9 * x$12_$_hi) + (x$12_$_lo >>> 0.0)) / 2.147483647E9);
        $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l, y$1, (r - l), (b - y$1), ((q < 0.22) ? "#5e6376" : ((q < 0.44) ? "#464a5c" : "#53576a")));
      }
      x$8 = (x$8 + 14.0);
    }
    y$1 = (y$1 + 6.0);
    row = ((1 + row) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 0.0, 60.0, 112.0, 2.0, "#4d5062");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 45.0, 44.0, 22.0, 16.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 47.0, 46.0, 18.0, 14.0, "#6a4a2a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 47.0, 52.0, 18.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 47.0, 56.0, 18.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 56.0, 53.0, 1.0, 1.0, "#c8a24a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 56.0, 54.0, 1.0, 1.0, "#c8a24a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 45.0, 44.0, 22.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 0.0, 60.0, 112.0, 114.0, "#6b6d63");
  var row$1 = 0;
  var y$3 = 60.0;
  while ((y$3 < 174.0)) {
    var near = ((y$3 - 60.0) / $uD(Math.max(1.0, 114.0)));
    var rh = (5.0 + (3.0 * near));
    var rw = (7.0 + (3.0 * near));
    var num$1 = row$1;
    var t$2 = ((num$1 >>> 31) | 0);
    if (((((1 & ((num$1 + t$2) | 0)) - t$2) | 0) === 0)) {
      var off$1 = 0.0;
    } else {
      var off$1 = (0.5 * rw);
    }
    var x$13 = (((0.0 - rw) - 1.0) + off$1);
    while ((x$13 < 112.0)) {
      var y$4 = x$13;
      var l$1 = $uD(Math.max(0.0, y$4));
      var x$14 = (x$13 + rw);
      var r$1 = $uD(Math.min(x$14, 112.0));
      var x$15 = (y$3 + rh);
      var b$1 = $uD(Math.min(x$15, 174.0));
      if (((r$1 > l$1) && (b$1 > y$3))) {
        var x$16_$_lo = elem_$_lo;
        var x$16_$_hi = elem_$_hi;
        var b0$4 = (65535 & x$16_$_lo);
        var b1$4 = ((x$16_$_lo >>> 16) | 0);
        var a0b0$4 = Math.imul(20077, b0$4);
        var a1b0$4 = Math.imul(16838, b0$4);
        var a0b1$4 = Math.imul(20077, b1$4);
        var lo$12 = ((a0b0$4 + (((a1b0$4 + a0b1$4) | 0) << 16)) | 0);
        var lo$13 = ((12345 + lo$12) | 0);
        var lo$14 = (2147483647 & lo$13);
        elem_$_lo = lo$14;
        elem_$_hi = 0;
        var x$17_$_lo = elem_$_lo;
        var x$17_$_hi = elem_$_hi;
        var q$1 = (((4.294967296E9 * x$17_$_hi) + (x$17_$_lo >>> 0.0)) / 2.147483647E9);
        $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$1, y$3, (r$1 - l$1), ((b$1 - y$3) - 1.0), ((q$1 < 0.22) ? "#aeb0a2" : ((q$1 < 0.42) ? "#8f9184" : "#a3a598")));
        if ((q$1 > 0.86)) {
          $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$1, y$3, (r$1 - l$1), 1.0, "#b3b4a6");
        }
        if ((q$1 < 0.08)) {
          $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, (l$1 + 1.0), (y$3 + 2.0), ((r$1 - l$1) - 2.0), 1.0, "#7c7f74");
        }
      }
      x$13 = (x$13 + (rw + 1.0));
    }
    y$3 = (y$3 + (rh + 1.0));
    row$1 = ((1 + row$1) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 20.0, 44.0, 5.0, 26.0, "#5a4a3a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 20.0, 44.0, 1.0, 26.0, "#6b5847");
  var k = 0;
  while ((k < 40)) {
    var x$18_$_lo = elem_$_lo;
    var x$18_$_hi = elem_$_hi;
    var b0$5 = (65535 & x$18_$_lo);
    var b1$5 = ((x$18_$_lo >>> 16) | 0);
    var a0b0$5 = Math.imul(20077, b0$5);
    var a1b0$5 = Math.imul(16838, b0$5);
    var a0b1$5 = Math.imul(20077, b1$5);
    var lo$15 = ((a0b0$5 + (((a1b0$5 + a0b1$5) | 0) << 16)) | 0);
    var lo$16 = ((12345 + lo$15) | 0);
    var lo$17 = (2147483647 & lo$16);
    elem_$_lo = lo$17;
    elem_$_hi = 0;
    var x$19_$_lo = elem_$_lo;
    var x$19_$_hi = elem_$_hi;
    var bx = (12.0 + (22.0 * (((4.294967296E9 * x$19_$_hi) + (x$19_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$20_$_lo = elem_$_lo;
    var x$20_$_hi = elem_$_hi;
    var b0$6 = (65535 & x$20_$_lo);
    var b1$6 = ((x$20_$_lo >>> 16) | 0);
    var a0b0$6 = Math.imul(20077, b0$6);
    var a1b0$6 = Math.imul(16838, b0$6);
    var a0b1$6 = Math.imul(20077, b1$6);
    var lo$18 = ((a0b0$6 + (((a1b0$6 + a0b1$6) | 0) << 16)) | 0);
    var lo$19 = ((12345 + lo$18) | 0);
    var lo$20 = (2147483647 & lo$19);
    elem_$_lo = lo$20;
    elem_$_hi = 0;
    var x$21_$_lo = elem_$_lo;
    var x$21_$_hi = elem_$_hi;
    var by = (26.0 + (22.0 * (((4.294967296E9 * x$21_$_hi) + (x$21_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$22_$_lo = elem_$_lo;
    var x$22_$_hi = elem_$_hi;
    var b0$7 = (65535 & x$22_$_lo);
    var b1$7 = ((x$22_$_lo >>> 16) | 0);
    var a0b0$7 = Math.imul(20077, b0$7);
    var a1b0$7 = Math.imul(16838, b0$7);
    var a0b1$7 = Math.imul(20077, b1$7);
    var lo$21 = ((a0b0$7 + (((a1b0$7 + a0b1$7) | 0) << 16)) | 0);
    var lo$22 = ((12345 + lo$21) | 0);
    var lo$23 = (2147483647 & lo$22);
    elem_$_lo = lo$23;
    elem_$_hi = 0;
    var x$23_$_lo = elem_$_lo;
    var x$23_$_hi = elem_$_hi;
    var sz = (2.0 + (3.0 * (((4.294967296E9 * x$23_$_hi) + (x$23_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$24_$_lo = elem_$_lo;
    var x$24_$_hi = elem_$_hi;
    var b0$8 = (65535 & x$24_$_lo);
    var b1$8 = ((x$24_$_lo >>> 16) | 0);
    var a0b0$8 = Math.imul(20077, b0$8);
    var a1b0$8 = Math.imul(16838, b0$8);
    var a0b1$8 = Math.imul(20077, b1$8);
    var lo$24 = ((a0b0$8 + (((a1b0$8 + a0b1$8) | 0) << 16)) | 0);
    var lo$25 = ((12345 + lo$24) | 0);
    var lo$26 = (2147483647 & lo$25);
    elem_$_lo = lo$26;
    elem_$_hi = 0;
    var x$25_$_lo = elem_$_lo;
    var x$25_$_hi = elem_$_hi;
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, bx, by, sz, sz, (((((4.294967296E9 * x$25_$_hi) + (x$25_$_lo >>> 0.0)) / 2.147483647E9) < 0.4) ? "#4e6f57" : "#3f5d4a"));
    k = ((1 + k) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 52.0, 118.0, 20.0, 2.0, "#6b4f2e");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 52.0, 118.0, 20.0, 1.0, "#8a6a3e");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 54.0, 120.0, 2.0, 12.0, "#7d6a52");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 68.0, 120.0, 2.0, 12.0, "#7d6a52");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 53.0, 120.0, 18.0, 1.0, "#5f5140");
  g.fillStyle = "#6f7486";
  g.beginPath();
  g.ellipse(62.0, 133.0, 11.0, 5.0, 0.0, 0.0, 6.283185307);
  g.fill();
  g.fillStyle = "#828799";
  g.beginPath();
  g.ellipse(62.0, 132.0, 11.0, 5.0, 0.0, 0.0, 6.283185307);
  g.fill();
  g.fillStyle = "#1a1f2e";
  g.beginPath();
  g.ellipse(62.0, 132.0, 8.0, 3.2, 0.0, 0.0, 6.283185307);
  g.fill();
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 59.0, 120.0, 1.0, 8.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 58.0, 127.0, 4.0, 3.0, "#5f4630");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 58.0, 127.0, 4.0, 1.0, "#7a5a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 8.0, 150.0, 12.0, 8.0, "#7d5a3a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 8.0, 150.0, 12.0, 1.0, "#8d6a44");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 10.0, 143.0, 8.0, 7.0, "#425c46");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 9.0, 146.0, 3.0, 4.0, "#4e6f57");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 92.0, 150.0, 12.0, 8.0, "#7d5a3a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 92.0, 150.0, 12.0, 1.0, "#8d6a44");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 94.0, 143.0, 8.0, 7.0, "#425c46");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 99.0, 145.0, 3.0, 5.0, "#4e6f57");
  k = 0;
  while ((k < 26)) {
    var x$26_$_lo = elem_$_lo;
    var x$26_$_hi = elem_$_hi;
    var b0$9 = (65535 & x$26_$_lo);
    var b1$9 = ((x$26_$_lo >>> 16) | 0);
    var a0b0$9 = Math.imul(20077, b0$9);
    var a1b0$9 = Math.imul(16838, b0$9);
    var a0b1$9 = Math.imul(20077, b1$9);
    var lo$27 = ((a0b0$9 + (((a1b0$9 + a0b1$9) | 0) << 16)) | 0);
    var lo$28 = ((12345 + lo$27) | 0);
    var lo$29 = (2147483647 & lo$28);
    elem_$_lo = lo$29;
    elem_$_hi = 0;
    var x$27_$_lo = elem_$_lo;
    var x$27_$_hi = elem_$_hi;
    var lx = (6.0 + (100.0 * (((4.294967296E9 * x$27_$_hi) + (x$27_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$28_$_lo = elem_$_lo;
    var x$28_$_hi = elem_$_hi;
    var b0$10 = (65535 & x$28_$_lo);
    var b1$10 = ((x$28_$_lo >>> 16) | 0);
    var a0b0$10 = Math.imul(20077, b0$10);
    var a1b0$10 = Math.imul(16838, b0$10);
    var a0b1$10 = Math.imul(20077, b1$10);
    var lo$30 = ((a0b0$10 + (((a1b0$10 + a0b1$10) | 0) << 16)) | 0);
    var lo$31 = ((12345 + lo$30) | 0);
    var lo$32 = (2147483647 & lo$31);
    elem_$_lo = lo$32;
    elem_$_hi = 0;
    var x$29_$_lo = elem_$_lo;
    var x$29_$_hi = elem_$_hi;
    var ly = (64.0 + (104.0 * (((4.294967296E9 * x$29_$_hi) + (x$29_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$30_$_lo = elem_$_lo;
    var x$30_$_hi = elem_$_hi;
    var b0$11 = (65535 & x$30_$_lo);
    var b1$11 = ((x$30_$_lo >>> 16) | 0);
    var a0b0$11 = Math.imul(20077, b0$11);
    var a1b0$11 = Math.imul(16838, b0$11);
    var a0b1$11 = Math.imul(20077, b1$11);
    var lo$33 = ((a0b0$11 + (((a1b0$11 + a0b1$11) | 0) << 16)) | 0);
    var lo$34 = ((12345 + lo$33) | 0);
    var lo$35 = (2147483647 & lo$34);
    elem_$_lo = lo$35;
    elem_$_hi = 0;
    var x$31_$_lo = elem_$_lo;
    var x$31_$_hi = elem_$_hi;
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, lx, ly, 2.0, 1.0, (((((4.294967296E9 * x$31_$_hi) + (x$31_$_lo >>> 0.0)) / 2.147483647E9) < 0.5) ? "#8a6a3e" : "#6f5a34"));
    k = ((1 + k) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 8.0, 112.0, 22.0, 3.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 8.0, 112.0, 22.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 10.0, 115.0, 2.0, 4.0, "#5f4a2c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 26.0, 115.0, 2.0, 4.0, "#5f4a2c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 172.0, 44.0, 3.0, "#7b7e70");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 174.0, 44.0, 1.0, "#5e6156");
  var row$2 = 0;
  var y$5 = 174.0;
  while ((y$5 < 860.0)) {
    var num$2 = row$2;
    var t$3 = ((num$2 >>> 31) | 0);
    if (((((1 & ((num$2 + t$3) | 0)) - t$3) | 0) === 0)) {
      var off$2 = 0.0;
    } else {
      var off$2 = 7.0;
    }
    var x$32 = ((-14.0) + off$2);
    while ((x$32 < 34.0)) {
      var y$6 = x$32;
      var l$2 = $uD(Math.max(0.0, y$6));
      var x$33 = ((x$32 + 14.0) - 1.0);
      var r$2 = $uD(Math.min(x$33, 34.0));
      var x$34 = ((y$5 + 6.0) - 1.0);
      var b$2 = $uD(Math.min(x$34, 860.0));
      if (((r$2 > l$2) && (b$2 > y$5))) {
        var x$35_$_lo = elem_$_lo;
        var x$35_$_hi = elem_$_hi;
        var b0$12 = (65535 & x$35_$_lo);
        var b1$12 = ((x$35_$_lo >>> 16) | 0);
        var a0b0$12 = Math.imul(20077, b0$12);
        var a1b0$12 = Math.imul(16838, b0$12);
        var a0b1$12 = Math.imul(20077, b1$12);
        var lo$36 = ((a0b0$12 + (((a1b0$12 + a0b1$12) | 0) << 16)) | 0);
        var lo$37 = ((12345 + lo$36) | 0);
        var lo$38 = (2147483647 & lo$37);
        elem_$_lo = lo$38;
        elem_$_hi = 0;
        var x$36_$_lo = elem_$_lo;
        var x$36_$_hi = elem_$_hi;
        var q$2 = (((4.294967296E9 * x$36_$_hi) + (x$36_$_lo >>> 0.0)) / 2.147483647E9);
        $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$2, y$5, (r$2 - l$2), (b$2 - y$5), ((q$2 < 0.22) ? "#5e6376" : ((q$2 < 0.44) ? "#464a5c" : "#53576a")));
      }
      x$32 = (x$32 + 14.0);
    }
    y$5 = (y$5 + 6.0);
    row$2 = ((1 + row$2) | 0);
  }
  var row$3 = 0;
  var y$7 = 174.0;
  while ((y$7 < 860.0)) {
    var num$3 = row$3;
    var t$4 = ((num$3 >>> 31) | 0);
    if (((((1 & ((num$3 + t$4) | 0)) - t$4) | 0) === 0)) {
      var off$3 = 0.0;
    } else {
      var off$3 = 7.0;
    }
    var x$37 = (64.0 + off$3);
    while ((x$37 < 112.0)) {
      var y$8 = x$37;
      var l$3 = $uD(Math.max(78.0, y$8));
      var x$38 = ((x$37 + 14.0) - 1.0);
      var r$3 = $uD(Math.min(x$38, 112.0));
      var x$39 = ((y$7 + 6.0) - 1.0);
      var b$3 = $uD(Math.min(x$39, 860.0));
      if (((r$3 > l$3) && (b$3 > y$7))) {
        var x$40_$_lo = elem_$_lo;
        var x$40_$_hi = elem_$_hi;
        var b0$13 = (65535 & x$40_$_lo);
        var b1$13 = ((x$40_$_lo >>> 16) | 0);
        var a0b0$13 = Math.imul(20077, b0$13);
        var a1b0$13 = Math.imul(16838, b0$13);
        var a0b1$13 = Math.imul(20077, b1$13);
        var lo$39 = ((a0b0$13 + (((a1b0$13 + a0b1$13) | 0) << 16)) | 0);
        var lo$40 = ((12345 + lo$39) | 0);
        var lo$41 = (2147483647 & lo$40);
        elem_$_lo = lo$41;
        elem_$_hi = 0;
        var x$41_$_lo = elem_$_lo;
        var x$41_$_hi = elem_$_hi;
        var q$3 = (((4.294967296E9 * x$41_$_hi) + (x$41_$_lo >>> 0.0)) / 2.147483647E9);
        $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$3, y$7, (r$3 - l$3), (b$3 - y$7), ((q$3 < 0.22) ? "#5e6376" : ((q$3 < 0.44) ? "#464a5c" : "#53576a")));
      }
      x$37 = (x$37 + 14.0);
    }
    y$7 = (y$7 + 6.0);
    row$3 = ((1 + row$3) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 174.0, 44.0, 686.0, "#696b61");
  var row$4 = 0;
  var y$9 = 174.0;
  while ((y$9 < 860.0)) {
    var near$1 = ((y$9 - 174.0) / $uD(Math.max(1.0, 686.0)));
    var rh$1 = (5.0 + (3.0 * near$1));
    var rw$1 = (7.0 + (3.0 * near$1));
    var num$4 = row$4;
    var t$5 = ((num$4 >>> 31) | 0);
    if (((((1 & ((num$4 + t$5) | 0)) - t$5) | 0) === 0)) {
      var off$4 = 0.0;
    } else {
      var off$4 = (0.5 * rw$1);
    }
    var x$42 = (((34.0 - rw$1) - 1.0) + off$4);
    while ((x$42 < 78.0)) {
      var y$10 = x$42;
      var l$4 = $uD(Math.max(34.0, y$10));
      var x$43 = (x$42 + rw$1);
      var r$4 = $uD(Math.min(x$43, 78.0));
      var x$44 = (y$9 + rh$1);
      var b$4 = $uD(Math.min(x$44, 860.0));
      if (((r$4 > l$4) && (b$4 > y$9))) {
        var x$45_$_lo = elem_$_lo;
        var x$45_$_hi = elem_$_hi;
        var b0$14 = (65535 & x$45_$_lo);
        var b1$14 = ((x$45_$_lo >>> 16) | 0);
        var a0b0$14 = Math.imul(20077, b0$14);
        var a1b0$14 = Math.imul(16838, b0$14);
        var a0b1$14 = Math.imul(20077, b1$14);
        var lo$42 = ((a0b0$14 + (((a1b0$14 + a0b1$14) | 0) << 16)) | 0);
        var lo$43 = ((12345 + lo$42) | 0);
        var lo$44 = (2147483647 & lo$43);
        elem_$_lo = lo$44;
        elem_$_hi = 0;
        var x$46_$_lo = elem_$_lo;
        var x$46_$_hi = elem_$_hi;
        var q$4 = (((4.294967296E9 * x$46_$_hi) + (x$46_$_lo >>> 0.0)) / 2.147483647E9);
        $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$4, y$9, (r$4 - l$4), ((b$4 - y$9) - 1.0), ((q$4 < 0.22) ? "#acaea0" : ((q$4 < 0.42) ? "#8d8f82" : "#a1a396")));
        if ((q$4 > 0.86)) {
          $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$4, y$9, (r$4 - l$4), 1.0, "#b3b4a6");
        }
        if ((q$4 < 0.08)) {
          $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, (l$4 + 1.0), (y$9 + 2.0), ((r$4 - l$4) - 2.0), 1.0, "#7c7f74");
        }
      }
      x$42 = (x$42 + (rw$1 + 1.0));
    }
    y$9 = (y$9 + (rh$1 + 1.0));
    row$4 = ((1 + row$4) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 0.0, 174.0, 34.0, 2.0, "#3f4354");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 78.0, 174.0, 34.0, 2.0, "#3f4354");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 176.0, 3.0, 684.0, "#5c5f52");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 75.0, 176.0, 3.0, 684.0, "#5c5f52");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 174.0, 2.0, 686.0, "#484c5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 76.0, 174.0, 2.0, 686.0, "#484c5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 55.0, 176.0, 2.0, 682.0, "#6f7284");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 55.0, 176.0, 1.0, 682.0, "#7d8090");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 22.0, 262.0, 12.0, 16.0, "#3c3f50");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 23.0, 263.0, 10.0, 14.0, "#20242f");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 23.0, 269.0, 10.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 27.0, 263.0, 1.0, 14.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 30.0, 263.0, 1.0, 14.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 78.0, 500.0, 14.0, 26.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 80.0, 502.0, 10.0, 22.0, "#63452a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 78.0, 500.0, 14.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 87.0, 514.0, 1.0, 1.0, "#c8a24a");
  k = 0;
  while ((k < 60)) {
    var x$47_$_lo = elem_$_lo;
    var x$47_$_hi = elem_$_hi;
    var b0$15 = (65535 & x$47_$_lo);
    var b1$15 = ((x$47_$_lo >>> 16) | 0);
    var a0b0$15 = Math.imul(20077, b0$15);
    var a1b0$15 = Math.imul(16838, b0$15);
    var a0b1$15 = Math.imul(20077, b1$15);
    var lo$45 = ((a0b0$15 + (((a1b0$15 + a0b1$15) | 0) << 16)) | 0);
    var lo$46 = ((12345 + lo$45) | 0);
    var lo$47 = (2147483647 & lo$46);
    elem_$_lo = lo$47;
    elem_$_hi = 0;
    var x$48_$_lo = elem_$_lo;
    var x$48_$_hi = elem_$_hi;
    var bx$2 = (30.0 * (((4.294967296E9 * x$48_$_hi) + (x$48_$_lo >>> 0.0)) / 2.147483647E9));
    var x$49_$_lo = elem_$_lo;
    var x$49_$_hi = elem_$_hi;
    var b0$16 = (65535 & x$49_$_lo);
    var b1$16 = ((x$49_$_lo >>> 16) | 0);
    var a0b0$16 = Math.imul(20077, b0$16);
    var a1b0$16 = Math.imul(16838, b0$16);
    var a0b1$16 = Math.imul(20077, b1$16);
    var lo$48 = ((a0b0$16 + (((a1b0$16 + a0b1$16) | 0) << 16)) | 0);
    var lo$49 = ((12345 + lo$48) | 0);
    var lo$50 = (2147483647 & lo$49);
    elem_$_lo = lo$50;
    elem_$_hi = 0;
    var x$50_$_lo = elem_$_lo;
    var x$50_$_hi = elem_$_hi;
    var by$2 = (200.0 + (600.0 * (((4.294967296E9 * x$50_$_hi) + (x$50_$_lo >>> 0.0)) / 2.147483647E9)));
    var x$51_$_lo = elem_$_lo;
    var x$51_$_hi = elem_$_hi;
    var b0$17 = (65535 & x$51_$_lo);
    var b1$17 = ((x$51_$_lo >>> 16) | 0);
    var a0b0$17 = Math.imul(20077, b0$17);
    var a1b0$17 = Math.imul(16838, b0$17);
    var a0b1$17 = Math.imul(20077, b1$17);
    var lo$51 = ((a0b0$17 + (((a1b0$17 + a0b1$17) | 0) << 16)) | 0);
    var lo$52 = ((12345 + lo$51) | 0);
    var lo$53 = (2147483647 & lo$52);
    elem_$_lo = lo$53;
    elem_$_hi = 0;
    var x$52_$_lo = elem_$_lo;
    var x$52_$_hi = elem_$_hi;
    var x$53_$_lo = elem_$_lo;
    var x$53_$_hi = elem_$_hi;
    var b0$18 = (65535 & x$53_$_lo);
    var b1$18 = ((x$53_$_lo >>> 16) | 0);
    var a0b0$18 = Math.imul(20077, b0$18);
    var a1b0$18 = Math.imul(16838, b0$18);
    var a0b1$18 = Math.imul(20077, b1$18);
    var lo$54 = ((a0b0$18 + (((a1b0$18 + a0b1$18) | 0) << 16)) | 0);
    var lo$55 = ((12345 + lo$54) | 0);
    var lo$56 = (2147483647 & lo$55);
    elem_$_lo = lo$56;
    elem_$_hi = 0;
    var x$54_$_lo = elem_$_lo;
    var x$54_$_hi = elem_$_hi;
    var x$55_$_lo = elem_$_lo;
    var x$55_$_hi = elem_$_hi;
    var b0$19 = (65535 & x$55_$_lo);
    var b1$19 = ((x$55_$_lo >>> 16) | 0);
    var a0b0$19 = Math.imul(20077, b0$19);
    var a1b0$19 = Math.imul(16838, b0$19);
    var a0b1$19 = Math.imul(20077, b1$19);
    var lo$57 = ((a0b0$19 + (((a1b0$19 + a0b1$19) | 0) << 16)) | 0);
    var lo$58 = ((12345 + lo$57) | 0);
    var lo$59 = (2147483647 & lo$58);
    elem_$_lo = lo$59;
    elem_$_hi = 0;
    var x$56_$_lo = elem_$_lo;
    var x$56_$_hi = elem_$_hi;
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, bx$2, by$2, (1.0 + (2.0 * (((4.294967296E9 * x$52_$_hi) + (x$52_$_lo >>> 0.0)) / 2.147483647E9))), (1.0 + (2.0 * (((4.294967296E9 * x$54_$_hi) + (x$54_$_lo >>> 0.0)) / 2.147483647E9))), (((((4.294967296E9 * x$56_$_hi) + (x$56_$_lo >>> 0.0)) / 2.147483647E9) < 0.5) ? "#45624c" : "#374f3d"));
    k = ((1 + k) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 318.0, 15.0, 18.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 35.0, 319.0, 13.0, 16.0, "#6a4a2a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 325.0, 15.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 41.0, 318.0, 1.0, 18.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 70.0, 622.0, 13.0, 20.0, "#6b5847");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 70.0, 622.0, 13.0, 1.0, "#82613a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 70.0, 630.0, 13.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 70.0, 638.0, 13.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 452.0, 8.0, 7.0, "#7d5a3a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 452.0, 8.0, 1.0, "#8d6a44");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 36.0, 446.0, 4.0, 6.0, "#425c46");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 35.0, 448.0, 2.0, 3.0, "#4e6f57");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 76.0, 604.0, 10.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 79.0, 605.0, 4.0, 8.0, "#5f4630");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 78.0, 613.0, 6.0, 1.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 80.0, 607.0, 1.0, 1.0, "#b8863c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 74.0, 174.0, 3.0, 200.0, "#4f5464");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 74.0, 174.0, 1.0, 200.0, "#5e6474");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 72.0, 370.0, 7.0, 3.0, "#4a4e5c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 556.0, 13.0, 12.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 35.0, 557.0, 11.0, 10.0, "#6a4a2a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 562.0, 13.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 36.0, 544.0, 10.0, 11.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 37.0, 545.0, 8.0, 9.0, "#6a4a2a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 36.0, 549.0, 10.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 70.0, 296.0, 6.0, 6.0, "#5f5140");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 70.0, 296.0, 6.0, 1.0, "#7d6a52");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 78.0, 700.0, 1.0, 22.0, "#6b5847");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 77.0, 700.0, 3.0, 2.0, "#8a6a3e");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 78.0, 720.0, 1.0, 3.0, "#4a4e5c");
  var row$5 = 0;
  var y$11 = 860.0;
  while ((y$11 < 900.0)) {
    var num$5 = row$5;
    var t$6 = ((num$5 >>> 31) | 0);
    if (((((1 & ((num$5 + t$6) | 0)) - t$6) | 0) === 0)) {
      var off$5 = 0.0;
    } else {
      var off$5 = 7.0;
    }
    var x$57 = ((-14.0) + off$5);
    while ((x$57 < 112.0)) {
      var y$12 = x$57;
      var l$5 = $uD(Math.max(0.0, y$12));
      var x$58 = ((x$57 + 14.0) - 1.0);
      var r$5 = $uD(Math.min(x$58, 112.0));
      var x$59 = ((y$11 + 6.0) - 1.0);
      var b$5 = $uD(Math.min(x$59, 900.0));
      if (((r$5 > l$5) && (b$5 > y$11))) {
        var x$60_$_lo = elem_$_lo;
        var x$60_$_hi = elem_$_hi;
        var b0$20 = (65535 & x$60_$_lo);
        var b1$20 = ((x$60_$_lo >>> 16) | 0);
        var a0b0$20 = Math.imul(20077, b0$20);
        var a1b0$20 = Math.imul(16838, b0$20);
        var a0b1$20 = Math.imul(20077, b1$20);
        var lo$60 = ((a0b0$20 + (((a1b0$20 + a0b1$20) | 0) << 16)) | 0);
        var lo$61 = ((12345 + lo$60) | 0);
        var lo$62 = (2147483647 & lo$61);
        elem_$_lo = lo$62;
        elem_$_hi = 0;
        var x$61_$_lo = elem_$_lo;
        var x$61_$_hi = elem_$_hi;
        var q$5 = (((4.294967296E9 * x$61_$_hi) + (x$61_$_lo >>> 0.0)) / 2.147483647E9);
        $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, l$5, y$11, (r$5 - l$5), (b$5 - y$11), ((q$5 < 0.22) ? "#5e6376" : ((q$5 < 0.44) ? "#464a5c" : "#53576a")));
      }
      x$57 = (x$57 + 14.0);
    }
    y$11 = (y$11 + 6.0);
    row$5 = ((1 + row$5) | 0);
  }
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 44.0, 862.0, 24.0, 28.0, "#7a5530");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 46.0, 864.0, 20.0, 26.0, "#6a4a2a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 44.0, 862.0, 24.0, 1.0, "#8d6a3c");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 64.0, 878.0, 1.0, 1.0, "#c8a24a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 64.0, 879.0, 1.0, 1.0, "#c8a24a");
  $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, 34.0, 856.0, 44.0, 4.0, "#7c7f90");
  var li = 0;
  while ((li < $n($n($thiz.LRender__f_world).LWorld__f_lanterns).u.length)) {
    var l$6 = $n($n($thiz.LRender__f_world).LWorld__f_lanterns).get(li);
    var $x_1 = $n(l$6).LLantern__f_x;
    var num$6 = $n($thiz.LRender__f_world).LWorld__f_W;
    var left = ($x_1 < (((num$6 + ((num$6 >>> 31) | 0)) | 0) >> 1));
    var wall = (left ? 34.0 : 78.0);
    var y$13 = $n(l$6).LLantern__f_x;
    var x0 = $uD(Math.min(wall, y$13));
    var y$14 = $n(l$6).LLantern__f_x;
    var x1 = $uD(Math.max(wall, y$14));
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, x0, ($n(l$6).LLantern__f_y - 9.0), ((x1 - x0) + 1.0), 1.0, "#4a4e5c");
    $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g, (left ? x0 : (x1 - 1.0)), ($n(l$6).LLantern__f_y - 9.0), 2.0, 2.0, "#5d6172");
    li = ((1 + li) | 0);
  }
  $thiz.LRender__f_stat = c;
}
function $p_LRender__shadow__sjs_js_Dynamic__D__D__D__D__V($thiz, ctx, x, y, rx, ry) {
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#0b0c16";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0.0, 0.0, 6.283185307);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}
function $p_LRender__hueColour__D__T3($thiz, h) {
  if ((h >= 0.0)) {
    var _2 = (205.0 - (45.0 * h));
    var _3 = (140.0 - (60.0 * h));
    return new $c_T3(255.0, _2, _3);
  } else {
    var _1 = (205.0 + (40.0 * h));
    return new $c_T3(_1, 225.0, 255.0);
  }
}
function $p_LRender__rect$1__sjs_js_Dynamic__D__D__D__D__T__V($thiz, g$1, x, y, w, h, col) {
  g$1.fillStyle = col;
  g$1.fillRect(x, y, w, h);
}
/** @constructor */
function $c_LRender(world) {
  this.LRender__f_world = null;
  this.LRender__f_light = null;
  this.LRender__f_stat = null;
  this.LRender__f_doc = null;
  this.LRender__f_world = world;
  this.LRender__f_light = new $c_LLighting($n(world).LWorld__f_VIEW_W, $n(world).LWorld__f_VIEW_H);
  this.LRender__f_stat = null;
  this.LRender__f_doc = document;
}
$c_LRender.prototype = new $h_O();
$c_LRender.prototype.constructor = $c_LRender;
/** @constructor */
function $h_LRender() {
}
$h_LRender.prototype = $c_LRender.prototype;
$c_LRender.prototype.draw__sjs_js_Dynamic__V = (function(ctx) {
  $p_LRender__build__V(this);
  var t = $n(this.LRender__f_world).LWorld__f_time;
  var cam = $n(this.LRender__f_world).LWorld__f_camY;
  var settle = (1.5 * $n(this.LRender__f_world).LWorld__f_pulse);
  var warmCast = $n(this.LRender__f_world).LWorld__f_warmth;
  var golden = (($n(this.LRender__f_world).LWorld__f_lanternTended >= $n($n(this.LRender__f_world).LWorld__f_lanterns).u.length) ? 1.0 : 0.0);
  var ambR = ((((104.0 + (16.0 * warmCast)) + (8.0 * golden)) + (10.0 * $n(this.LRender__f_world).LWorld__f_pulse)) - (14.0 * $n(this.LRender__f_world).LWorld__f_rain));
  var ambG = ((((108.0 + (6.0 * warmCast)) + (2.0 * golden)) + (6.0 * $n(this.LRender__f_world).LWorld__f_pulse)) - (16.0 * $n(this.LRender__f_world).LWorld__f_rain));
  var ambB = ((((146.0 - (12.0 * warmCast)) - (26.0 * golden)) + (4.0 * $n(this.LRender__f_world).LWorld__f_pulse)) + (8.0 * $n(this.LRender__f_world).LWorld__f_rain));
  $n(this.LRender__f_light).begin__D__D__D__V(ambR, ambG, ambB);
  $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V(31.0, (15.0 - cam), 54.0, 152.0, 176.0, 232.0, 0.34);
  $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V(56.0, (cam + 190.0), 215.0, 118.0, 126.0, 164.0, 0.42);
  $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V(56.0, (178.0 - cam), 46.0, 255.0, 196.0, 140.0, 0.22);
  $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V(56.0, (900.0 - cam), 120.0, 120.0, 118.0, 150.0, 0.18);
  var i = 0;
  while ((i < $n($n(this.LRender__f_world).LWorld__f_lanterns).u.length)) {
    var l = $n($n(this.LRender__f_world).LWorld__f_lanterns).get(i);
    var x = ((8.3 * t) + (1.7 * i));
    var flick = ((0.9 + (0.1 * $uD(Math.sin(x)))) + (0.18 * $n(l).LLantern__f_flick));
    matchResult1: {
      var \u03b43$;
      var x1 = $p_LRender__hueColour__D__T3(this, $n(l).LLantern__f_hue);
      if ((x1 !== null)) {
        $uD($n(x1).T3__f__1);
        $uD($n(x1).T3__f__2);
        $uD($n(x1).T3__f__3);
        var \u03b43$ = x1;
        break matchResult1;
      }
      throw new $c_s_MatchError(x1);
    }
    var cr$2 = $uD($n(\u03b43$).T3__f__1);
    var cg$2 = $uD($n(\u03b43$).T3__f__2);
    var cb$2 = $uD($n(\u03b43$).T3__f__3);
    var $x_5 = $n(this.LRender__f_light);
    var $x_4 = $n(l).LLantern__f_x;
    var $x_3 = $n(l).LLantern__f_sway;
    var $x_2 = $n(l).LLantern__f_y;
    var $x_1 = $n(l).LLantern__f_warm;
    var y = (1.05 * $n(l).LLantern__f_warm);
    $x_5.add__D__D__D__D__D__D__D__V(($x_4 + $x_3), ($x_2 - cam), (38.0 + (26.0 * $x_1)), cr$2, cg$2, cb$2, ($uD(Math.min(1.0, y)) * flick));
    $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V(($n(l).LLantern__f_x + $n(l).LLantern__f_sway), (($n(l).LLantern__f_y + 10.0) - cam), 22.0, cr$2, (0.92 * cg$2), (0.8 * cb$2), ((0.42 * $n(l).LLantern__f_warm) * flick));
    i = ((1 + i) | 0);
  }
  $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V($n(this.LRender__f_world).LWorld__f_wx, (($n(this.LRender__f_world).LWorld__f_wy - 10.0) - cam), 30.0, 255.0, 200.0, 150.0, 0.42);
  if (($n(this.LRender__f_world).LWorld__f_ghostA > 0.0)) {
    $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V($n(this.LRender__f_world).LWorld__f_wellX, ($n(this.LRender__f_world).LWorld__f_ghostY - cam), 42.0, 255.0, 228.0, 172.0, (0.55 * $n(this.LRender__f_world).LWorld__f_ghostA));
  }
  if (($n(this.LRender__f_world).LWorld__f_windowLit > 0.01)) {
    $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V($n(this.LRender__f_world).LWorld__f_windowX, ($n(this.LRender__f_world).LWorld__f_windowY - cam), 30.0, 255.0, 196.0, 132.0, (0.5 * $n(this.LRender__f_world).LWorld__f_windowLit));
  }
  if (($n(this.LRender__f_world).LWorld__f_doorLight > 0.01)) {
    $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V($n(this.LRender__f_world).LWorld__f_doorX, (526.0 - cam), 20.0, 255.0, 208.0, 150.0, (0.42 * $n(this.LRender__f_world).LWorld__f_doorLight));
  }
  if (($n(this.LRender__f_world).LWorld__f_revealT >= 0.0)) {
    var y$1 = (1.0 - ($n(this.LRender__f_world).LWorld__f_revealT / 14.0));
    var g = $uD(Math.max(0.0, y$1));
    $n(this.LRender__f_light).add__D__D__D__D__D__D__D__V(56.0, (46.0 - cam), 30.0, 255.0, 220.0, 170.0, (0.45 * g));
  }
  ctx.save();
  var value = ((-cam) + settle);
  ctx.translate(0.0, value);
  ctx.drawImage(this.LRender__f_stat, 0.0, 0.0);
  if (($n(this.LRender__f_world).LWorld__f_windowLit > 0.01)) {
    var value$1 = (0.9 * $n(this.LRender__f_world).LWorld__f_windowLit);
    ctx.globalAlpha = value$1;
    ctx.fillStyle = "#ffce8c";
    ctx.fillRect(23.0, 263.0, 10.0, 14.0);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#4a4e5c";
    ctx.fillRect(23.0, 269.0, 10.0, 1.0);
    ctx.fillRect(27.0, 263.0, 1.0, 14.0);
    ctx.fillRect(30.0, 263.0, 1.0, 14.0);
    ctx.globalCompositeOperation = "lighter";
    var value$2 = (0.14 * $n(this.LRender__f_world).LWorld__f_windowLit);
    ctx.globalAlpha = value$2;
    ctx.fillStyle = "#8a5c2a";
    ctx.beginPath();
    var value$3 = ($n(this.LRender__f_world).LWorld__f_windowY + 18.0);
    ctx.ellipse(36.0, value$3, 12.0, 6.0, 0.0, 0.0, 6.283185307);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1.0;
  }
  if (($n(this.LRender__f_world).LWorld__f_doorLight > 0.01)) {
    var value$4 = (0.85 * $n(this.LRender__f_world).LWorld__f_doorLight);
    ctx.globalAlpha = value$4;
    ctx.fillStyle = "#ffd79a";
    ctx.fillRect(80.0, 524.0, 10.0, 1.0);
    var value$5 = (0.35 * $n(this.LRender__f_world).LWorld__f_doorLight);
    ctx.globalAlpha = value$5;
    ctx.fillRect(80.0, 525.0, 10.0, 1.0);
    ctx.globalAlpha = 1.0;
  }
  i = 0;
  while (true) {
    var $x_6 = i;
    var this$55 = $n($n(this.LRender__f_world).LWorld__f_particles);
    if (($x_6 < this$55.scm_ArrayBuffer__f_size0)) {
      var p = $as_LP($n($n(this.LRender__f_world).LWorld__f_particles).apply__I__O(i));
      if (($n(p).LP__f_kind === 4)) {
        var value$6 = (0.3 * ($n(p).LP__f_life / $n(p).LP__f_max));
        ctx.globalAlpha = value$6;
        ctx.fillStyle = "#3d4052";
        var value$7 = ($n(p).LP__f_x - 1.0);
        var value$8 = ($n(p).LP__f_y - 1.0);
        ctx.fillRect(value$7, value$8, 3.0, 2.0);
      }
      i = ((1 + i) | 0);
    } else {
      break;
    }
  }
  ctx.globalAlpha = 1.0;
  var wet = $n(this.LRender__f_world).LWorld__f_rain;
  var value$9 = (0.42 + (0.3 * wet));
  ctx.globalAlpha = value$9;
  ctx.fillStyle = "#232c46";
  ctx.beginPath();
  var value$10 = $n(this.LRender__f_world).LWorld__f_puddleX;
  var value$11 = $n(this.LRender__f_world).LWorld__f_puddleY;
  ctx.ellipse(value$10, value$11, 18.0, 5.5, 0.0, 0.0, 6.283185307);
  ctx.fill();
  var value$12 = (0.5 + (0.3 * wet));
  ctx.globalAlpha = value$12;
  ctx.strokeStyle = "#8f9ab8";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  var value$13 = $n(this.LRender__f_world).LWorld__f_puddleX;
  var value$14 = $n(this.LRender__f_world).LWorld__f_puddleY;
  ctx.ellipse(value$13, value$14, 18.0, 5.5, 0.0, 0.0, 6.283185307);
  ctx.stroke();
  ctx.globalAlpha = 1.0;
  if ((wet > 0.15)) {
    var value$15 = (0.5 * wet);
    ctx.globalAlpha = value$15;
    ctx.fillStyle = "#e2e4cd";
    ctx.beginPath();
    var value$16 = ($n(this.LRender__f_world).LWorld__f_puddleX - 2.0);
    var value$17 = $n(this.LRender__f_world).LWorld__f_puddleY;
    ctx.ellipse(value$16, value$17, 3.0, 1.2, 0.0, 0.0, 6.283185307);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
  i = 0;
  while ((i < $n($n(this.LRender__f_world).LWorld__f_coins).u.length)) {
    var c = $n($n(this.LRender__f_world).LWorld__f_coins).get(i);
    var vis = $n(this.LRender__f_world).coinVisible__I__D(i);
    if ((vis > 0.02)) {
      var glint = ((((1.6 * $n(c).LCoin__f_bob) % 1.0) < 0.5) ? $m_LSprites$().LSprites$__f_coinA : $m_LSprites$().LSprites$__f_coinB);
      var $x_10 = $m_LSprites$();
      var $x_9 = $m_LSprites$().LSprites$__f_coinPal;
      var $x_8 = $n(c).LCoin__f_x;
      var $x_7 = $n(c).LCoin__f_y;
      var x$1 = (1.7 * $n(c).LCoin__f_bob);
      $x_10.blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, glint, $x_9, ($x_8 - 3.0), (($x_7 - 3.0) + (0.6 * $uD(Math.sin(x$1)))), false, $uD(Math.min(1.0, vis)));
    }
    i = ((1 + i) | 0);
  }
  i = 0;
  while ((i < $n($n(this.LRender__f_world).LWorld__f_lanterns).u.length)) {
    var l$2 = $n($n(this.LRender__f_world).LWorld__f_lanterns).get(i);
    if (($n(l$2).LLantern__f_warm > 0.05)) {
      ctx.globalCompositeOperation = "lighter";
      var value$18 = ($n(l$2).LLantern__f_x + $n(l$2).LLantern__f_sway);
      var value$19 = ($n(l$2).LLantern__f_y - cam);
      var value$20 = ($n(l$2).LLantern__f_x + $n(l$2).LLantern__f_sway);
      var value$21 = ($n(l$2).LLantern__f_y - cam);
      var value$22 = (9.0 + (9.0 * $n(l$2).LLantern__f_warm));
      var bloom = ctx.createRadialGradient(value$18, value$19, 0.0, value$20, value$21, value$22);
      var this$105 = (0.3 * $n(l$2).LLantern__f_warm);
      var s = (("rgba(255,206,140," + ("" + this$105)) + ")");
      bloom.addColorStop(0.0, s);
      bloom.addColorStop(1.0, "rgba(255,180,90,0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      var value$23 = ($n(l$2).LLantern__f_x + $n(l$2).LLantern__f_sway);
      var value$24 = ($n(l$2).LLantern__f_y - cam);
      var value$25 = (9.0 + (9.0 * $n(l$2).LLantern__f_warm));
      ctx.arc(value$23, value$24, value$25, 0.0, 6.283185307);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    var x$2 = ((6.1 * t) + i);
    var breathing = ($uD(Math.sin(x$2)) > 0.0);
    var grid = ((($n(l$2).LLantern__f_flick > 0.2) || breathing) ? $m_LSprites$().LSprites$__f_lanternB : $m_LSprites$().LSprites$__f_lanternA);
    var $x_15 = $m_LSprites$();
    var $x_14 = $m_LSprites$().LSprites$__f_lanternPal;
    var $x_13 = $n(l$2).LLantern__f_x;
    var $x_12 = $n(l$2).LLantern__f_sway;
    var $x_11 = $n(l$2).LLantern__f_y;
    var y$2 = $n(l$2).LLantern__f_warm;
    $x_15.blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, grid, $x_14, (($x_13 + $x_12) - 4.5), ($x_11 - 8.0), false, (0.6 + (0.4 * $uD(Math.max(0.25, y$2)))));
    var y$3 = $doubleToInt((3.4 * $n(l$2).LLantern__f_warm));
    var m = ((y$3 > 3) ? 3 : y$3);
    var mi = 0;
    while ((mi < m)) {
      var ang = (((t * (0.7 + (0.21 * mi))) + (2.2 * mi)) + i);
      var rad = (7.0 + (2.6 * mi));
      var mg = (((((3.0 * t) + mi) % 1.0) < 0.5) ? $m_LSprites$().LSprites$__f_mothA : $m_LSprites$().LSprites$__f_mothB);
      var $x_20 = $m_LSprites$();
      var $x_19 = $m_LSprites$().LSprites$__f_mothPal;
      var $x_18 = $n(l$2).LLantern__f_x;
      var $x_17 = $uD(Math.cos(ang));
      var $x_16 = $n(l$2).LLantern__f_y;
      var x$3 = (1.3 * ang);
      $x_20.blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, mg, $x_19, (($x_18 + ($x_17 * rad)) - 1.0), (($x_16 + (3.0 * $uD(Math.sin(x$3)))) - 2.0), false, 0.55);
      mi = ((1 + mi) | 0);
    }
    i = ((1 + i) | 0);
  }
  if (($n(this.LRender__f_world).LWorld__f_ghostA > 0.0)) {
    var value$26 = (0.55 * $n(this.LRender__f_world).LWorld__f_ghostA);
    ctx.globalAlpha = value$26;
    ctx.fillStyle = "#ffe6b4";
    ctx.beginPath();
    var value$27 = $n(this.LRender__f_world).LWorld__f_wellX;
    var value$28 = $n(this.LRender__f_world).LWorld__f_ghostY;
    var x$4 = (2.0 * t);
    var value$29 = (3.5 + (2.0 * $uD(Math.sin(x$4))));
    ctx.arc(value$27, value$28, value$29, 0.0, 6.283185307);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
  if (($n(this.LRender__f_world).LWorld__f_foxMode !== 0)) {
    var fg = ((((6.0 * $n(this.LRender__f_world).LWorld__f_time) % 1.0) < 0.5) ? $m_LSprites$().LSprites$__f_foxA : $m_LSprites$().LSprites$__f_foxB);
    var fflip = ($n(this.LRender__f_world).LWorld__f_foxMode === 3);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, fg, ($n(this.LRender__f_world).LWorld__f_fx - 8.0), ($n(this.LRender__f_world).LWorld__f_fy - 6.0), fflip, "#0d0e18", 0.5);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, fg, ($n(this.LRender__f_world).LWorld__f_fx - 6.0), ($n(this.LRender__f_world).LWorld__f_fy - 6.0), fflip, "#0d0e18", 0.5);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, fg, ($n(this.LRender__f_world).LWorld__f_fx - 7.0), ($n(this.LRender__f_world).LWorld__f_fy - 7.0), fflip, "#0d0e18", 0.5);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, fg, ($n(this.LRender__f_world).LWorld__f_fx - 7.0), ($n(this.LRender__f_world).LWorld__f_fy - 5.0), fflip, "#0d0e18", 0.5);
    $m_LSprites$().blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, fg, $m_LSprites$().LSprites$__f_foxPal, ($n(this.LRender__f_world).LWorld__f_fx - 7.0), ($n(this.LRender__f_world).LWorld__f_fy - 6.0), fflip, 1.0);
  }
  if (($n(this.LRender__f_world).LWorld__f_catMode !== 0)) {
    $p_LRender__shadow__sjs_js_Dynamic__D__D__D__D__V(this, ctx, $n(this.LRender__f_world).LWorld__f_cx, $n(this.LRender__f_world).LWorld__f_cy, 7.0, 2.0);
    var grid$2 = ((($n(this.LRender__f_world).LWorld__f_catMode === 2) || ($n(this.LRender__f_world).LWorld__f_catMode === 4)) ? $m_LSprites$().LSprites$__f_catSit : ((((7.0 * $n(this.LRender__f_world).LWorld__f_time) % 1.0) < 0.5) ? $m_LSprites$().LSprites$__f_catA : $m_LSprites$().LSprites$__f_catB));
    var cgy = ($n(this.LRender__f_world).LWorld__f_cy - ((grid$2 === $m_LSprites$().LSprites$__f_catSit) ? 7.0 : 6.0));
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$2, ($n(this.LRender__f_world).LWorld__f_cx - 7.0), cgy, ($n(this.LRender__f_world).LWorld__f_cdir < 0), "#0d0e18", 0.5);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$2, ($n(this.LRender__f_world).LWorld__f_cx - 5.0), cgy, ($n(this.LRender__f_world).LWorld__f_cdir < 0), "#0d0e18", 0.5);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$2, ($n(this.LRender__f_world).LWorld__f_cx - 6.0), (cgy - 1.0), ($n(this.LRender__f_world).LWorld__f_cdir < 0), "#0d0e18", 0.5);
    $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$2, ($n(this.LRender__f_world).LWorld__f_cx - 6.0), (cgy + 1.0), ($n(this.LRender__f_world).LWorld__f_cdir < 0), "#0d0e18", 0.5);
    $m_LSprites$().blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, grid$2, $m_LSprites$().LSprites$__f_catPal, ($n(this.LRender__f_world).LWorld__f_cx - 6.0), cgy, ($n(this.LRender__f_world).LWorld__f_cdir < 0), 1.0);
  }
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#7a5426";
  ctx.beginPath();
  var value$30 = ($n(this.LRender__f_world).LWorld__f_wx + (($n(this.LRender__f_world).LWorld__f_facing === 2) ? (-8.0) : 6.0));
  var value$31 = ($n(this.LRender__f_world).LWorld__f_wy - 12.0);
  ctx.arc(value$30, value$31, 16.0, 0.0, 6.283185307);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1.0;
  $p_LRender__shadow__sjs_js_Dynamic__D__D__D__D__V(this, ctx, $n(this.LRender__f_world).LWorld__f_wx, $n(this.LRender__f_world).LWorld__f_wy, 6.0, 2.2);
  if ($n(this.LRender__f_world).LWorld__f_walking) {
    var bob = ((($n(this.LRender__f_world).LWorld__f_bobT % 1.0) < 0.5) ? (-1.0) : 0.0);
  } else {
    var x$5 = (1.6 * t);
    var bob = (0.4 * $uD(Math.sin(x$5)));
  }
  var phaseA = (($n(this.LRender__f_world).LWorld__f_animT % 1.0) < 0.5);
  var \u03b41$___1;
  var \u03b41$___2;
  var x5 = $n(this.LRender__f_world).LWorld__f_facing;
  switch (x5) {
    case 0: {
      var _1 = (phaseA ? $m_LSprites$().LSprites$__f_backA : $m_LSprites$().LSprites$__f_backB);
      var \u03b41$___1 = _1;
      var \u03b41$___2 = false;
      break;
    }
    case 1: {
      var _1$1 = (phaseA ? $m_LSprites$().LSprites$__f_frontA : $m_LSprites$().LSprites$__f_frontB);
      var \u03b41$___1 = _1$1;
      var \u03b41$___2 = false;
      break;
    }
    case 2: {
      var _1$2 = (phaseA ? $m_LSprites$().LSprites$__f_sideA : $m_LSprites$().LSprites$__f_sideB);
      var \u03b41$___1 = _1$2;
      var \u03b41$___2 = true;
      break;
    }
    default: {
      var _1$3 = (phaseA ? $m_LSprites$().LSprites$__f_sideA : $m_LSprites$().LSprites$__f_sideB);
      var \u03b41$___1 = _1$3;
      var \u03b41$___2 = false;
    }
  }
  var grid$3 = $asArrayOf_T(\u03b41$___1, 1);
  var flip = $uZ(\u03b41$___2);
  var gx = ($n(this.LRender__f_world).LWorld__f_wx - 5.0);
  var gy = (($n(this.LRender__f_world).LWorld__f_wy - $n(grid$3).u.length) + bob);
  $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$3, (gx - 1.0), gy, flip, "#0d0e18", 0.55);
  $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$3, (gx + 1.0), gy, flip, "#0d0e18", 0.55);
  $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$3, gx, (gy - 1.0), flip, "#0d0e18", 0.55);
  $m_LSprites$().silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V(ctx, grid$3, gx, (gy + 1.0), flip, "#0d0e18", 0.55);
  $m_LSprites$().blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, grid$3, $m_LSprites$().LSprites$__f_person, gx, gy, flip, 1.0);
  var lampSide = (flip ? (-10.0) : 6.0);
  $m_LSprites$().blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, $m_LSprites$().LSprites$__f_handLamp, $m_LSprites$().LSprites$__f_lanternPal, ($n(this.LRender__f_world).LWorld__f_wx + lampSide), (($n(this.LRender__f_world).LWorld__f_wy - 13.0) + bob), false, 0.95);
  i = 0;
  while (true) {
    var $x_21 = i;
    var this$152 = $n($n(this.LRender__f_world).LWorld__f_particles);
    if (($x_21 < this$152.scm_ArrayBuffer__f_size0)) {
      var p$2 = $as_LP($n($n(this.LRender__f_world).LWorld__f_particles).apply__I__O(i));
      var y$4 = ($n(p$2).LP__f_life / $n(p$2).LP__f_max);
      var lifeQ = $uD(Math.max(0.0, y$4));
      var x6 = $n(p$2).LP__f_kind;
      switch (x6) {
        case 0: {
          ctx.globalAlpha = lifeQ;
          ctx.fillStyle = (($n(p$2).LP__f_vy > 0.0) ? "#fff6d8" : "#fffbe8");
          var value$32 = $n(p$2).LP__f_x;
          var value$33 = $n(p$2).LP__f_y;
          ctx.fillRect(value$32, value$33, 1.0, 1.0);
          break;
        }
        case 1: {
          var value$34 = (0.9 * lifeQ);
          ctx.globalAlpha = value$34;
          $m_LSprites$().blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V(ctx, $m_LSprites$().LSprites$__f_leaf, $m_LSprites$().LSprites$__f_leafPal, $n(p$2).LP__f_x, $n(p$2).LP__f_y, false, 1.0);
          break;
        }
        case 3: {
          var value$35 = (0.35 * lifeQ);
          ctx.globalAlpha = value$35;
          ctx.strokeStyle = "#cfd8ee";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          var value$36 = $n(p$2).LP__f_x;
          var value$37 = $n(p$2).LP__f_y;
          var value$38 = (9.0 * $n(p$2).LP__f_size);
          var value$39 = (3.0 * $n(p$2).LP__f_size);
          ctx.ellipse(value$36, value$37, value$38, value$39, 0.0, 0.0, 6.283185307);
          ctx.stroke();
          break;
        }
        case 5: {
          var value$40 = (0.55 * lifeQ);
          ctx.globalAlpha = value$40;
          ctx.fillStyle = "#ffeec4";
          var value$41 = $n(p$2).LP__f_x;
          var value$42 = $n(p$2).LP__f_y;
          ctx.fillRect(value$41, value$42, 1.0, 1.0);
          break;
        }
      }
      i = ((1 + i) | 0);
    } else {
      break;
    }
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
  if (($n(this.LRender__f_world).LWorld__f_rain > 0.02)) {
    var value$43 = (0.1 * $n(this.LRender__f_world).LWorld__f_rain);
    ctx.globalAlpha = value$43;
    ctx.fillStyle = "#2a3350";
    var value$44 = $n(this.LRender__f_world).LWorld__f_VIEW_W;
    var value$45 = $n(this.LRender__f_world).LWorld__f_VIEW_H;
    ctx.fillRect(0.0, 0.0, value$44, value$45);
    ctx.globalAlpha = 1.0;
  }
  if (($n(this.LRender__f_world).LWorld__f_rain > 0.02)) {
    var value$46 = (0.24 + (0.28 * $n(this.LRender__f_world).LWorld__f_rain));
    ctx.globalAlpha = value$46;
    ctx.fillStyle = "#c9d4ef";
    i = 0;
    while ((i < 46)) {
      var rx = ((((37.7 * i) + ((26.0 * t) * $n(this.LRender__f_world).LWorld__f_rain)) % ($n(this.LRender__f_world).LWorld__f_VIEW_W + 40.0)) - 20.0);
      var ry = ((((61.3 * i) + (300.0 * t)) % ($n(this.LRender__f_world).LWorld__f_VIEW_H + 40.0)) - 20.0);
      ctx.fillRect(rx, ry, 1.0, 5.0);
      i = ((1 + i) | 0);
    }
    ctx.globalAlpha = 1.0;
  }
  var motes = ((8 + $doubleToInt((10.0 * $n(this.LRender__f_world).LWorld__f_warmth))) | 0);
  var mi2 = 0;
  while ((mi2 < motes)) {
    var a = ((0.18 * t) + (1.7 * mi2));
    var x$6 = ((0.7 * a) + mi2);
    var mx = (56.0 + (22.0 * $uD(Math.sin(x$6))));
    var my = ((((53.0 * mi2) + (6.0 * t)) % 320.0) + cam);
    var value$47 = (0.12 + (0.22 * $n(this.LRender__f_world).lightAt__D__D__D(mx, my)));
    ctx.globalAlpha = value$47;
    ctx.fillStyle = "#fff6d8";
    var value$48 = (my - cam);
    ctx.fillRect(mx, value$48, 1.0, 1.0);
    mi2 = ((1 + mi2) | 0);
  }
  ctx.globalAlpha = 1.0;
  $n(this.LRender__f_light).finish__sjs_js_Dynamic__V(ctx);
  var value$49 = (0.5 * $n(this.LRender__f_world).LWorld__f_VIEW_W);
  var value$50 = (0.55 * $n(this.LRender__f_world).LWorld__f_VIEW_H);
  var value$51 = (0.28 * $n(this.LRender__f_world).LWorld__f_VIEW_H);
  var value$52 = (0.5 * $n(this.LRender__f_world).LWorld__f_VIEW_W);
  var value$53 = (0.55 * $n(this.LRender__f_world).LWorld__f_VIEW_H);
  var value$54 = (0.78 * $n(this.LRender__f_world).LWorld__f_VIEW_H);
  var vg = ctx.createRadialGradient(value$49, value$50, value$51, value$52, value$53, value$54);
  vg.addColorStop(0.0, "rgba(0,0,0,0)");
  vg.addColorStop(1.0, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vg;
  var value$55 = $n(this.LRender__f_world).LWorld__f_VIEW_W;
  var value$56 = $n(this.LRender__f_world).LWorld__f_VIEW_H;
  ctx.fillRect(0.0, 0.0, value$55, value$56);
  if (((($n(this.LRender__f_world).LWorld__f_idleT > 5.0) && (!$n(this.LRender__f_world).LWorld__f_walking)) && ($n(this.LRender__f_world).LWorld__f_rain < 0.5))) {
    var coldest = (-1);
    var bestW = 1.1;
    i = 0;
    while ((i < $n($n(this.LRender__f_world).LWorld__f_lanterns).u.length)) {
      var l$3 = $n($n(this.LRender__f_world).LWorld__f_lanterns).get(i);
      if (((($n(l$3).LLantern__f_warm < bestW) && ($n(l$3).LLantern__f_y > (cam - 20.0))) && ($n(l$3).LLantern__f_y < ((cam + $n(this.LRender__f_world).LWorld__f_VIEW_H) + 20.0)))) {
        bestW = $n(l$3).LLantern__f_warm;
        coldest = i;
      }
      i = ((1 + i) | 0);
    }
    if ((coldest >= 0)) {
      var l$4 = $n($n(this.LRender__f_world).LWorld__f_lanterns).get(coldest);
      var x$7 = (1.8 * t);
      var ph = ((0.5 * $uD(Math.sin(x$7))) + 0.5);
      var value$57 = (0.1 + (0.14 * ph));
      ctx.globalAlpha = value$57;
      ctx.strokeStyle = "#ffdca0";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      var value$58 = $n(l$4).LLantern__f_x;
      var value$59 = ($n(l$4).LLantern__f_y - cam);
      var value$60 = (8.0 + (5.0 * ph));
      ctx.arc(value$58, value$59, value$60, 0.0, 6.283185307);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }
});
var $d_LRender = new $TypeData().initClass($c_LRender, "Render", ({
  LRender: 1
}));
function $p_LSound__t__D($thiz) {
  return $uD($thiz.LSound__f_ctx.currentTime);
}
function $p_LSound__burst__D__D__D__D__T__V($thiz, freq, q, dur, gain, kind) {
  if ((!$thiz.LSound__f_on)) {
    return (void 0);
  }
  var t0 = $p_LSound__t__D($thiz);
  var src = $thiz.LSound__f_ctx.createBufferSource();
  src.buffer = $thiz.LSound__f_noiseBuf;
  src.loop = true;
  var f = $thiz.LSound__f_ctx.createBiquadFilter();
  f.type = kind;
  f.frequency.value = freq;
  f.Q.value = q;
  var g = $thiz.LSound__f_ctx.createGain();
  g.gain.setValueAtTime(1.0E-4, t0);
  var $x_1 = g.gain;
  var value = (t0 + (0.25 * dur));
  $x_1.linearRampToValueAtTime(gain, value);
  var $x_2 = g.gain;
  var value$1 = (t0 + dur);
  $x_2.exponentialRampToValueAtTime(1.0E-4, value$1);
  src.connect(f);
  f.connect(g);
  g.connect($thiz.LSound__f_master);
  var value$2 = (1.5 * $uD(Math.random()));
  src.start(t0, value$2);
  var value$3 = ((t0 + dur) + 0.05);
  src.stop(value$3);
}
function $p_LSound__bell__D__D__D__D__V($thiz, freq, gain, when, decay) {
  if ((!$thiz.LSound__f_on)) {
    return (void 0);
  }
  var t0 = ($p_LSound__t__D($thiz) + when);
  var o = $thiz.LSound__f_ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t0);
  var o2 = $thiz.LSound__f_ctx.createOscillator();
  o2.type = "sine";
  var $x_1 = o2.frequency;
  var value = (2.01 * freq);
  $x_1.setValueAtTime(value, t0);
  var g2 = $thiz.LSound__f_ctx.createGain();
  g2.gain.value = 0.25;
  var g = $thiz.LSound__f_ctx.createGain();
  g.gain.setValueAtTime(1.0E-4, t0);
  var $x_2 = g.gain;
  var value$1 = (t0 + 0.008);
  $x_2.linearRampToValueAtTime(gain, value$1);
  var $x_3 = g.gain;
  var value$2 = (t0 + decay);
  $x_3.exponentialRampToValueAtTime(1.0E-4, value$2);
  o.connect(g);
  o2.connect(g2);
  g2.connect(g);
  g.connect($thiz.LSound__f_master);
  o.start(t0);
  o2.start(t0);
  var value$3 = ((t0 + decay) + 0.05);
  o.stop(value$3);
  var value$4 = ((t0 + decay) + 0.05);
  o2.stop(value$4);
}
function $p_LSound__tone__D__D__D__D__T__V($thiz, f1, f2, dur, gain, kind) {
  if ((!$thiz.LSound__f_on)) {
    return (void 0);
  }
  var t0 = $p_LSound__t__D($thiz);
  var o = $thiz.LSound__f_ctx.createOscillator();
  o.type = kind;
  o.frequency.setValueAtTime(f1, t0);
  var $x_1 = o.frequency;
  var value = (t0 + dur);
  $x_1.exponentialRampToValueAtTime(f2, value);
  var g = $thiz.LSound__f_ctx.createGain();
  g.gain.setValueAtTime(1.0E-4, t0);
  var $x_2 = g.gain;
  var value$1 = (t0 + (0.2 * dur));
  $x_2.linearRampToValueAtTime(gain, value$1);
  var $x_3 = g.gain;
  var value$2 = (t0 + dur);
  $x_3.exponentialRampToValueAtTime(1.0E-4, value$2);
  o.connect(g);
  g.connect($thiz.LSound__f_master);
  o.start(t0);
  var value$3 = ((t0 + dur) + 0.05);
  o.stop(value$3);
}
/** @constructor */
function $c_LSound() {
  this.LSound__f_ctx = null;
  this.LSound__f_master = null;
  this.LSound__f_amb = null;
  this.LSound__f_windGain = null;
  this.LSound__f_padGain = null;
  this.LSound__f_rainGain = null;
  this.LSound__f_humGain = null;
  this.LSound__f_noiseBuf = null;
  this.LSound__f_stepToggle = false;
  this.LSound__f_rainNow = 0.0;
  this.LSound__f_rainWant = 0.0;
  this.LSound__f_dropIn = 0.0;
  this.LSound__f_distantIn = 0.0;
  this.LSound__f_scale = null;
  this.LSound__f_on = false;
  this.LSound__f_warmth = 0.0;
  this.LSound__f_ctx = null;
  this.LSound__f_master = null;
  this.LSound__f_amb = null;
  this.LSound__f_windGain = null;
  this.LSound__f_padGain = null;
  this.LSound__f_rainGain = null;
  this.LSound__f_humGain = null;
  this.LSound__f_noiseBuf = null;
  this.LSound__f_stepToggle = false;
  this.LSound__f_rainNow = 0.0;
  this.LSound__f_rainWant = 0.0;
  this.LSound__f_dropIn = 1.0;
  this.LSound__f_distantIn = 50.0;
  this.LSound__f_scale = new $ac_D(new Float64Array([523.25, 587.33, 659.25, 783.99, 880.0]));
  this.LSound__f_on = false;
  this.LSound__f_warmth = 0.0;
}
$c_LSound.prototype = new $h_O();
$c_LSound.prototype.constructor = $c_LSound;
/** @constructor */
function $h_LSound() {
}
$h_LSound.prototype = $c_LSound.prototype;
$c_LSound.prototype.ensure__V = (function() {
  if ((this.LSound__f_ctx !== null)) {
    return (void 0);
  }
  var AC = AudioContext;
  this.LSound__f_ctx = new AC();
  this.LSound__f_master = this.LSound__f_ctx.createGain();
  this.LSound__f_master.gain.value = 0.62;
  var comp = this.LSound__f_ctx.createDynamicsCompressor();
  comp.threshold.value = (-14.0);
  comp.knee.value = 22.0;
  comp.ratio.value = 9.0;
  comp.attack.value = 0.005;
  comp.release.value = 0.25;
  this.LSound__f_master.connect(comp);
  comp.connect(this.LSound__f_ctx.destination);
  var sr = $uD(this.LSound__f_ctx.sampleRate);
  var len = $doubleToInt((2.0 * sr));
  var buf = this.LSound__f_ctx.createBuffer(1, len, sr);
  var data = buf.getChannelData(0);
  var i = 0;
  while ((i < len)) {
    var this$11 = i;
    var value = ((2.0 * $uD(Math.random())) - 1.0);
    data[("" + this$11)] = value;
    i = ((1 + i) | 0);
  }
  this.LSound__f_noiseBuf = buf;
  this.LSound__f_amb = this.LSound__f_ctx.createGain();
  this.LSound__f_amb.gain.value = 0.0;
  this.LSound__f_amb.connect(this.LSound__f_master);
  var windSrc = this.LSound__f_ctx.createBufferSource();
  windSrc.buffer = this.LSound__f_noiseBuf;
  windSrc.loop = true;
  var windF = this.LSound__f_ctx.createBiquadFilter();
  windF.type = "lowpass";
  windF.frequency.value = 420.0;
  windF.Q.value = 0.7;
  this.LSound__f_windGain = this.LSound__f_ctx.createGain();
  this.LSound__f_windGain.gain.value = 0.085;
  windSrc.connect(windF);
  windF.connect(this.LSound__f_windGain);
  this.LSound__f_windGain.connect(this.LSound__f_amb);
  windSrc.start();
  var lfo = this.LSound__f_ctx.createOscillator();
  lfo.frequency.value = 0.06;
  var lfoG = this.LSound__f_ctx.createGain();
  lfoG.gain.value = 170.0;
  lfo.connect(lfoG);
  lfoG.connect(windF.frequency);
  lfo.start();
  this.LSound__f_padGain = this.LSound__f_ctx.createGain();
  this.LSound__f_padGain.gain.value = 0.055;
  var padF = this.LSound__f_ctx.createBiquadFilter();
  padF.type = "lowpass";
  padF.frequency.value = 900.0;
  this.LSound__f_padGain.connect(padF);
  padF.connect(this.LSound__f_amb);
  var oa = this.LSound__f_ctx.createOscillator();
  oa.type = "triangle";
  oa.frequency.value = 55.0;
  var ob = this.LSound__f_ctx.createOscillator();
  ob.type = "sine";
  ob.frequency.value = 82.41;
  var oc = this.LSound__f_ctx.createOscillator();
  oc.type = "sine";
  oc.frequency.value = 110.0;
  var ocg = this.LSound__f_ctx.createGain();
  ocg.gain.value = 0.3;
  oa.connect(this.LSound__f_padGain);
  ob.connect(this.LSound__f_padGain);
  oc.connect(ocg);
  ocg.connect(this.LSound__f_padGain);
  oa.start();
  ob.start();
  oc.start();
  var trem = this.LSound__f_ctx.createOscillator();
  trem.frequency.value = 0.07;
  var tremG = this.LSound__f_ctx.createGain();
  tremG.gain.value = 0.022;
  trem.connect(tremG);
  tremG.connect(this.LSound__f_padGain.gain);
  trem.start();
  this.LSound__f_humGain = this.LSound__f_ctx.createGain();
  this.LSound__f_humGain.gain.value = 0.018;
  var h1 = this.LSound__f_ctx.createOscillator();
  h1.type = "sine";
  h1.frequency.value = 110.0;
  var h2 = this.LSound__f_ctx.createOscillator();
  h2.type = "sine";
  h2.frequency.value = 110.7;
  h1.connect(this.LSound__f_humGain);
  h2.connect(this.LSound__f_humGain);
  this.LSound__f_humGain.connect(this.LSound__f_amb);
  h1.start();
  h2.start();
  var rainSrc = this.LSound__f_ctx.createBufferSource();
  rainSrc.buffer = this.LSound__f_noiseBuf;
  rainSrc.loop = true;
  var rainF = this.LSound__f_ctx.createBiquadFilter();
  rainF.type = "bandpass";
  rainF.frequency.value = 1500.0;
  rainF.Q.value = 0.6;
  this.LSound__f_rainGain = this.LSound__f_ctx.createGain();
  this.LSound__f_rainGain.gain.value = 0.0;
  rainSrc.connect(rainF);
  rainF.connect(this.LSound__f_rainGain);
  this.LSound__f_rainGain.connect(this.LSound__f_amb);
  rainSrc.start();
});
$c_LSound.prototype.unmute__V = (function() {
  this.ensure__V();
  this.LSound__f_ctx.resume();
  this.LSound__f_on = true;
  var now = $p_LSound__t__D(this);
  this.LSound__f_amb.gain.cancelScheduledValues(now);
  this.LSound__f_amb.gain.setValueAtTime(this.LSound__f_amb.gain.value, now);
  var $x_1 = this.LSound__f_amb.gain;
  var value = (now + 0.35);
  $x_1.linearRampToValueAtTime(1.0, value);
  this.chime__V();
});
$c_LSound.prototype.mute__V = (function() {
  this.LSound__f_on = false;
  if ((this.LSound__f_ctx === null)) {
    return (void 0);
  }
  var now = $p_LSound__t__D(this);
  this.LSound__f_amb.gain.cancelScheduledValues(now);
  this.LSound__f_amb.gain.setValueAtTime(this.LSound__f_amb.gain.value, now);
  var $x_1 = this.LSound__f_amb.gain;
  var value = (now + 0.45);
  $x_1.linearRampToValueAtTime(0.0, value);
});
$c_LSound.prototype.resumeIfOn__V = (function() {
  if ((this.LSound__f_on && (this.LSound__f_ctx !== null))) {
    this.LSound__f_ctx.resume();
  }
});
$c_LSound.prototype.state__T = (function() {
  return ((this.LSound__f_ctx === null) ? "none" : $dp_toString__T($n(this.LSound__f_ctx.state)));
});
$c_LSound.prototype.chime__V = (function() {
  $p_LSound__bell__D__D__D__D__V(this, 392.0, 0.2, 0.0, 1.4);
  $p_LSound__bell__D__D__D__D__V(this, 587.33, 0.15, 0.1, 1.9);
});
$c_LSound.prototype.step__V = (function() {
  this.LSound__f_stepToggle = (!this.LSound__f_stepToggle);
  $p_LSound__burst__D__D__D__D__T__V(this, (this.LSound__f_stepToggle ? 760.0 : 600.0), 1.5, 0.08, 0.045, "bandpass");
});
$c_LSound.prototype.warm__V = (function() {
  $p_LSound__tone__D__D__D__D__T__V(this, 196.0, 262.0, 0.75, 0.13, "sine");
  $p_LSound__bell__D__D__D__D__V(this, 784.0, 0.05, 0.03, 1.1);
  $p_LSound__burst__D__D__D__D__T__V(this, 700.0, 0.7, 0.35, 0.035, "lowpass");
});
$c_LSound.prototype.tend__V = (function() {
  $p_LSound__bell__D__D__D__D__V(this, 523.25, 0.09, 0.0, 1.7);
  $p_LSound__bell__D__D__D__D__V(this, 659.25, 0.08, 0.09, 1.7);
  $p_LSound__bell__D__D__D__D__V(this, 783.99, 0.07, 0.18, 1.9);
  $p_LSound__bell__D__D__D__D__V(this, 1567.98, 0.04, 0.3, 1.3);
});
$c_LSound.prototype.coin__I__V = (function(n) {
  var $x_1 = $n(this.LSound__f_scale);
  var y = (($n(this.LSound__f_scale).u.length - 1) | 0);
  var y$1 = ((n < y) ? n : y);
  var f = $x_1.get(((y$1 < 0) ? 0 : y$1));
  $p_LSound__bell__D__D__D__D__V(this, f, 0.15, 0.0, 1.5);
  $p_LSound__bell__D__D__D__D__V(this, (1.5 * f), 0.1, 0.12, 2.0);
});
$c_LSound.prototype.gust__V = (function() {
  $p_LSound__burst__D__D__D__D__T__V(this, 1400.0, 0.9, 1.2, 0.09, "bandpass");
  $p_LSound__tone__D__D__D__D__T__V(this, 96.0, 54.0, 0.9, 0.05, "triangle");
});
$c_LSound.prototype.purr__V = (function() {
  if ((!this.LSound__f_on)) {
    return (void 0);
  }
  var t0 = $p_LSound__t__D(this);
  var o = this.LSound__f_ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(86.0, t0);
  var f = this.LSound__f_ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 340.0;
  var g = this.LSound__f_ctx.createGain();
  g.gain.setValueAtTime(1.0E-4, t0);
  var $x_1 = g.gain;
  var value = (t0 + 0.15);
  $x_1.linearRampToValueAtTime(0.055, value);
  var $x_2 = g.gain;
  var value$1 = (t0 + 1.3);
  $x_2.linearRampToValueAtTime(1.0E-4, value$1);
  var trem = this.LSound__f_ctx.createOscillator();
  trem.frequency.value = 26.0;
  var tremG = this.LSound__f_ctx.createGain();
  tremG.gain.value = 0.028;
  trem.connect(tremG);
  tremG.connect(g.gain);
  trem.start(t0);
  var value$2 = (t0 + 1.3);
  trem.stop(value$2);
  o.connect(f);
  f.connect(g);
  g.connect(this.LSound__f_master);
  o.start(t0);
  var value$3 = (t0 + 1.35);
  o.stop(value$3);
});
$c_LSound.prototype.ripple__V = (function() {
  $p_LSound__bell__D__D__D__D__V(this, 880.0, 0.06, 0.0, 1.1);
  $p_LSound__bell__D__D__D__D__V(this, 1174.66, 0.045, 0.07, 1.3);
  $p_LSound__burst__D__D__D__D__T__V(this, 2100.0, 1.0, 0.2, 0.03, "bandpass");
});
$c_LSound.prototype.reveal__V = (function() {
  $p_LSound__tone__D__D__D__D__T__V(this, 330.0, 660.0, 2.4, 0.055, "sine");
  $p_LSound__bell__D__D__D__D__V(this, 659.25, 0.09, 0.15, 3.0);
  $p_LSound__bell__D__D__D__D__V(this, 987.77, 0.06, 0.65, 3.4);
});
$c_LSound.prototype.hiss__V = (function() {
  $p_LSound__burst__D__D__D__D__T__V(this, 3400.0, 0.7, 0.55, 0.028, "highpass");
  $p_LSound__burst__D__D__D__D__T__V(this, 1800.0, 1.0, 0.3, 0.02, "bandpass");
});
$c_LSound.prototype.knock__V = (function() {
  $p_LSound__tone__D__D__D__D__T__V(this, 150.0, 74.0, 0.16, 0.1, "triangle");
  $p_LSound__burst__D__D__D__D__T__V(this, 420.0, 1.2, 0.13, 0.05, "lowpass");
});
$c_LSound.prototype.insideRoom__V = (function() {
  $p_LSound__bell__D__D__D__D__V(this, 659.25, 0.055, 0.0, 2.2);
  $p_LSound__bell__D__D__D__D__V(this, 880.0, 0.04, 0.13, 2.6);
  $p_LSound__burst__D__D__D__D__T__V(this, 320.0, 0.8, 0.35, 0.03, "lowpass");
});
$c_LSound.prototype.answered__V = (function() {
  $p_LSound__bell__D__D__D__D__V(this, 523.25, 0.07, 0.0, 2.4);
  $p_LSound__bell__D__D__D__D__V(this, 392.0, 0.05, 0.36, 3.0);
});
$c_LSound.prototype.sync__D__D__D__V = (function(warm, rain, dt) {
  this.LSound__f_warmth = warm;
  this.LSound__f_rainWant = rain;
  if ((this.LSound__f_ctx === null)) {
    return (void 0);
  }
  if (this.LSound__f_on) {
    var $x_3 = this.LSound__f_rainNow;
    var $x_2 = this.LSound__f_rainWant;
    var $x_1 = this.LSound__f_rainNow;
    var y = (0.25 * dt);
    this.LSound__f_rainNow = ($x_3 + (($x_2 - $x_1) * $uD(Math.min(1.0, y))));
    var $x_4 = this.LSound__f_rainGain.gain;
    var value = (0.11 * this.LSound__f_rainNow);
    var value$1 = $p_LSound__t__D(this);
    $x_4.setTargetAtTime(value, value$1, 0.6);
    var $x_5 = this.LSound__f_windGain.gain;
    var value$2 = (0.085 + (0.05 * this.LSound__f_rainNow));
    var value$3 = $p_LSound__t__D(this);
    $x_5.setTargetAtTime(value$2, value$3, 1.5);
    var $x_6 = this.LSound__f_padGain.gain;
    var value$4 = (0.05 + (0.035 * this.LSound__f_warmth));
    var value$5 = $p_LSound__t__D(this);
    $x_6.setTargetAtTime(value$4, value$5, 2.0);
    this.LSound__f_dropIn = (this.LSound__f_dropIn - (dt * (0.2 + (1.6 * this.LSound__f_rainNow))));
    if ((this.LSound__f_dropIn <= 0.0)) {
      this.LSound__f_dropIn = (0.5 + (2.5 * $uD(Math.random())));
      if ((this.LSound__f_rainNow > 0.05)) {
        $p_LSound__burst__D__D__D__D__T__V(this, 2400.0, 1.2, 0.1, 0.03, "bandpass");
      }
    }
    this.LSound__f_distantIn = (this.LSound__f_distantIn - dt);
    if ((this.LSound__f_distantIn <= 0.0)) {
      this.LSound__f_distantIn = (45.0 + (60.0 * $uD(Math.random())));
      $p_LSound__bell__D__D__D__D__V(this, (0.5 * $n(this.LSound__f_scale).get((($doubleToInt(($uD(Math.random()) * $n(this.LSound__f_scale).u.length)) % $checkIntDivisor($n(this.LSound__f_scale).u.length)) | 0))), 0.045, 0.0, 3.0);
    }
  }
});
var $d_LSound = new $TypeData().initClass($c_LSound, "Sound", ({
  LSound: 1
}));
/** @constructor */
function $c_LSprites$() {
  this.LSprites$__f_person = null;
  this.LSprites$__f_lanternPal = null;
  this.LSprites$__f_coinPal = null;
  this.LSprites$__f_catPal = null;
  this.LSprites$__f_foxPal = null;
  this.LSprites$__f_mothPal = null;
  this.LSprites$__f_leafPal = null;
  this.LSprites$__f_legsApart = null;
  this.LSprites$__f_legsTogether = null;
  this.LSprites$__f_backA = null;
  this.LSprites$__f_backB = null;
  this.LSprites$__f_frontA = null;
  this.LSprites$__f_frontB = null;
  this.LSprites$__f_sideA = null;
  this.LSprites$__f_sideB = null;
  this.LSprites$__f_handLamp = null;
  this.LSprites$__f_lanternA = null;
  this.LSprites$__f_lanternB = null;
  this.LSprites$__f_coinA = null;
  this.LSprites$__f_coinB = null;
  this.LSprites$__f_catA = null;
  this.LSprites$__f_catB = null;
  this.LSprites$__f_catSit = null;
  this.LSprites$__f_foxA = null;
  this.LSprites$__f_foxB = null;
  this.LSprites$__f_mothA = null;
  this.LSprites$__f_mothB = null;
  this.LSprites$__f_leaf = null;
  this.LSprites$__f_scale = 0.0;
  $n_LSprites$ = this;
  var this$34 = $m_sci_Map$();
  var x0 = new $c_T2($bC(104), "#262a48");
  var x1 = new $c_T2($bC(72), "#414463");
  var x2 = new $c_T2($bC(115), "#f6dcbb");
  var x3 = new $c_T2($bC(107), "#16161f");
  var x4 = new $c_T2($bC(99), "#46538a");
  var x5 = new $c_T2($bC(67), "#5f6da6");
  var x6 = new $c_T2($bC(100), "#2f3559");
  var x7 = new $c_T2($bC(114), "#e09070");
  var x8 = new $c_T2($bC(112), "#313852");
  var x9 = new $c_T2($bC(98), "#1e2233");
  var array = [x0, x1, x2, x3, x4, x5, x6, x7, x8, x9];
  var elems = new $c_sjsr_WrappedVarArgs(array);
  this.LSprites$__f_person = this$34.from__sc_IterableOnce__sci_Map(elems);
  var this$50 = $m_sci_Map$();
  var x0$1 = new $c_T2($bC(99), "#7d6a48");
  var x1$1 = new $c_T2($bC(107), "#332e24");
  var x2$1 = new $c_T2($bC(121), "#ffb454");
  var x3$1 = new $c_T2($bC(70), "#ffe9a8");
  var array$1 = [x0$1, x1$1, x2$1, x3$1];
  var elems$1 = new $c_sjsr_WrappedVarArgs(array$1);
  this.LSprites$__f_lanternPal = this$50.from__sc_IterableOnce__sci_Map(elems$1);
  var this$63 = $m_sci_Map$();
  var x0$2 = new $c_T2($bC(111), "#8a6a2a");
  var x1$2 = new $c_T2($bC(79), "#e8c05a");
  var x2$2 = new $c_T2($bC(66), "#fff2c0");
  var array$2 = [x0$2, x1$2, x2$2];
  var elems$2 = new $c_sjsr_WrappedVarArgs(array$2);
  this.LSprites$__f_coinPal = this$63.from__sc_IterableOnce__sci_Map(elems$2);
  var this$79 = $m_sci_Map$();
  var x0$3 = new $c_T2($bC(109), "#43435a");
  var x1$3 = new $c_T2($bC(77), "#55556e");
  var x2$3 = new $c_T2($bC(103), "#7ad9a0");
  var x3$2 = new $c_T2($bC(112), "#c98f6a");
  var array$3 = [x0$3, x1$3, x2$3, x3$2];
  var elems$3 = new $c_sjsr_WrappedVarArgs(array$3);
  this.LSprites$__f_catPal = this$79.from__sc_IterableOnce__sci_Map(elems$3);
  var this$95 = $m_sci_Map$();
  var x0$4 = new $c_T2($bC(102), "#b5643c");
  var x1$4 = new $c_T2($bC(70), "#d8834f");
  var x2$4 = new $c_T2($bC(119), "#efe6d8");
  var x3$3 = new $c_T2($bC(107), "#221a18");
  var array$4 = [x0$4, x1$4, x2$4, x3$3];
  var elems$4 = new $c_sjsr_WrappedVarArgs(array$4);
  this.LSprites$__f_foxPal = this$95.from__sc_IterableOnce__sci_Map(elems$4);
  var this$105 = $m_sci_Map$();
  var x0$5 = new $c_T2($bC(119), "#e8e2d0");
  var x1$5 = new $c_T2($bC(77), "#c9c0a6");
  var array$5 = [x0$5, x1$5];
  var elems$5 = new $c_sjsr_WrappedVarArgs(array$5);
  this.LSprites$__f_mothPal = this$105.from__sc_IterableOnce__sci_Map(elems$5);
  var this$115 = $m_sci_Map$();
  var x0$6 = new $c_T2($bC(108), "#a8743c");
  var x1$6 = new $c_T2($bC(76), "#c9985a");
  var array$6 = [x0$6, x1$6];
  var elems$6 = new $c_sjsr_WrappedVarArgs(array$6);
  this.LSprites$__f_leafPal = this$115.from__sc_IterableOnce__sci_Map(elems$6);
  this.LSprites$__f_legsApart = new ($d_T.getArrayOf().constr)(["..pp..pp..", "..pp..pp..", "..pp..pp..", "..bb..bb..", ".bbb..bbb."]);
  this.LSprites$__f_legsTogether = new ($d_T.getArrayOf().constr)(["...pppp...", "...pppp...", "...pppp...", "...bbbb...", "..bbbbbb.."]);
  var xs = new ($d_T.getArrayOf().constr)(["...hhhh...", "..hhhhhh..", "..hhhhhh..", "..hHHHHh..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp.."]);
  var xs$1 = this.LSprites$__f_legsApart;
  var evidence$25__runtimeClass;
  var evidence$25__runtimeClass = $d_T.getClassOf();
  var this$120 = $m_s_Array$();
  var newLength = ((xs.u.length + $n(xs$1).u.length) | 0);
  var runtimeClass = evidence$25__runtimeClass;
  if ((runtimeClass !== null)) {
    var this$121 = $n(runtimeClass);
    var $x_1 = (this$121 === $d_V.getClassOf());
  } else {
    var $x_1 = false;
  }
  if ($x_1) {
    var dest$1 = $p_s_Array$__newUnitArray__I__Ajl_Void(this$120, newLength);
  } else {
    var this$122 = $n(runtimeClass);
    if (this$122.data.isAssignableFrom($d_T)) {
      var this$123 = $n(runtimeClass);
      if (this$123.data.isPrimitive) {
        var dest$1 = this$120.copyOf__O__I__O(xs, newLength);
      } else {
        var this$125 = $n(runtimeClass).data.newArray(0);
        var destArrayClass = $objectGetClass(this$125);
        var dest$1 = $m_ju_Arrays$().copyOf__AO__I__jl_Class__AO(xs, newLength, destArrayClass);
      }
    } else {
      var componentType = evidence$25__runtimeClass;
      var dest = $n(componentType).data.newArray(newLength);
      $m_s_Array$().copy__O__I__O__I__I__V(xs, 0, dest, 0, xs.u.length);
      var dest$1 = dest;
    }
  }
  $m_s_Array$().copy__O__I__O__I__I__V(xs$1, 0, dest$1, xs.u.length, $n(xs$1).u.length);
  this.LSprites$__f_backA = $asArrayOf_T(dest$1, 1);
  var xs$2 = new ($d_T.getArrayOf().constr)(["...hhhh...", "..hhhhhh..", "..hhhhhh..", "..hHHHHh..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp.."]);
  var xs$3 = this.LSprites$__f_legsTogether;
  var evidence$25$1__runtimeClass;
  var evidence$25$1__runtimeClass = $d_T.getClassOf();
  var this$132 = $m_s_Array$();
  var newLength$1 = ((xs$2.u.length + $n(xs$3).u.length) | 0);
  var runtimeClass$1 = evidence$25$1__runtimeClass;
  if ((runtimeClass$1 !== null)) {
    var this$133 = $n(runtimeClass$1);
    var $x_2 = (this$133 === $d_V.getClassOf());
  } else {
    var $x_2 = false;
  }
  if ($x_2) {
    var dest$3 = $p_s_Array$__newUnitArray__I__Ajl_Void(this$132, newLength$1);
  } else {
    var this$134 = $n(runtimeClass$1);
    if (this$134.data.isAssignableFrom($d_T)) {
      var this$135 = $n(runtimeClass$1);
      if (this$135.data.isPrimitive) {
        var dest$3 = this$132.copyOf__O__I__O(xs$2, newLength$1);
      } else {
        var this$137 = $n(runtimeClass$1).data.newArray(0);
        var destArrayClass$1 = $objectGetClass(this$137);
        var dest$3 = $m_ju_Arrays$().copyOf__AO__I__jl_Class__AO(xs$2, newLength$1, destArrayClass$1);
      }
    } else {
      var componentType$1 = evidence$25$1__runtimeClass;
      var dest$2 = $n(componentType$1).data.newArray(newLength$1);
      $m_s_Array$().copy__O__I__O__I__I__V(xs$2, 0, dest$2, 0, xs$2.u.length);
      var dest$3 = dest$2;
    }
  }
  $m_s_Array$().copy__O__I__O__I__I__V(xs$3, 0, dest$3, xs$2.u.length, $n(xs$3).u.length);
  this.LSprites$__f_backB = $asArrayOf_T(dest$3, 1);
  var xs$4 = new ($d_T.getArrayOf().constr)(["...hhhh...", "..hhhhhh..", "..hssssh..", "..ssssss..", "..skssks..", "..ssssss..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp.."]);
  var xs$5 = this.LSprites$__f_legsApart;
  var evidence$25$2__runtimeClass;
  var evidence$25$2__runtimeClass = $d_T.getClassOf();
  var this$144 = $m_s_Array$();
  var newLength$2 = ((xs$4.u.length + $n(xs$5).u.length) | 0);
  var runtimeClass$2 = evidence$25$2__runtimeClass;
  if ((runtimeClass$2 !== null)) {
    var this$145 = $n(runtimeClass$2);
    var $x_3 = (this$145 === $d_V.getClassOf());
  } else {
    var $x_3 = false;
  }
  if ($x_3) {
    var dest$5 = $p_s_Array$__newUnitArray__I__Ajl_Void(this$144, newLength$2);
  } else {
    var this$146 = $n(runtimeClass$2);
    if (this$146.data.isAssignableFrom($d_T)) {
      var this$147 = $n(runtimeClass$2);
      if (this$147.data.isPrimitive) {
        var dest$5 = this$144.copyOf__O__I__O(xs$4, newLength$2);
      } else {
        var this$149 = $n(runtimeClass$2).data.newArray(0);
        var destArrayClass$2 = $objectGetClass(this$149);
        var dest$5 = $m_ju_Arrays$().copyOf__AO__I__jl_Class__AO(xs$4, newLength$2, destArrayClass$2);
      }
    } else {
      var componentType$2 = evidence$25$2__runtimeClass;
      var dest$4 = $n(componentType$2).data.newArray(newLength$2);
      $m_s_Array$().copy__O__I__O__I__I__V(xs$4, 0, dest$4, 0, xs$4.u.length);
      var dest$5 = dest$4;
    }
  }
  $m_s_Array$().copy__O__I__O__I__I__V(xs$5, 0, dest$5, xs$4.u.length, $n(xs$5).u.length);
  this.LSprites$__f_frontA = $asArrayOf_T(dest$5, 1);
  var xs$6 = new ($d_T.getArrayOf().constr)(["...hhhh...", "..hhhhhh..", "..hssssh..", "..ssssss..", "..skssks..", "..ssssss..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp.."]);
  var xs$7 = this.LSprites$__f_legsTogether;
  var evidence$25$3__runtimeClass;
  var evidence$25$3__runtimeClass = $d_T.getClassOf();
  var this$156 = $m_s_Array$();
  var newLength$3 = ((xs$6.u.length + $n(xs$7).u.length) | 0);
  var runtimeClass$3 = evidence$25$3__runtimeClass;
  if ((runtimeClass$3 !== null)) {
    var this$157 = $n(runtimeClass$3);
    var $x_4 = (this$157 === $d_V.getClassOf());
  } else {
    var $x_4 = false;
  }
  if ($x_4) {
    var dest$7 = $p_s_Array$__newUnitArray__I__Ajl_Void(this$156, newLength$3);
  } else {
    var this$158 = $n(runtimeClass$3);
    if (this$158.data.isAssignableFrom($d_T)) {
      var this$159 = $n(runtimeClass$3);
      if (this$159.data.isPrimitive) {
        var dest$7 = this$156.copyOf__O__I__O(xs$6, newLength$3);
      } else {
        var this$161 = $n(runtimeClass$3).data.newArray(0);
        var destArrayClass$3 = $objectGetClass(this$161);
        var dest$7 = $m_ju_Arrays$().copyOf__AO__I__jl_Class__AO(xs$6, newLength$3, destArrayClass$3);
      }
    } else {
      var componentType$3 = evidence$25$3__runtimeClass;
      var dest$6 = $n(componentType$3).data.newArray(newLength$3);
      $m_s_Array$().copy__O__I__O__I__I__V(xs$6, 0, dest$6, 0, xs$6.u.length);
      var dest$7 = dest$6;
    }
  }
  $m_s_Array$().copy__O__I__O__I__I__V(xs$7, 0, dest$7, xs$6.u.length, $n(xs$7).u.length);
  this.LSprites$__f_frontB = $asArrayOf_T(dest$7, 1);
  this.LSprites$__f_sideA = new ($d_T.getArrayOf().constr)(["...hhhh...", "..hhhhhh..", "..hhssss..", "..hsksss..", "..hsssss..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp..", "..ppp.pp..", "..pp..pp..", "..p....p..", "..p....p..", "..bb..bb..", ".bbb..bbb."]);
  this.LSprites$__f_sideB = new ($d_T.getArrayOf().constr)(["...hhhh...", "..hhhhhh..", "..hhssss..", "..hsksss..", "..hsssss..", "...rrrr...", "..cCCCCc..", ".ccCCCCcc.", ".cCCCCCCc.", ".cCCCCCCc.", ".dcCCCCcd.", ".ddccccdd.", "..pppppp..", "..pppppp..", "..ppp.pp..", "...p...p..", "...p...p..", "...bb.bb..", "..bbb.bb.."]);
  this.LSprites$__f_handLamp = new ($d_T.getArrayOf().constr)(["..c..", ".ccc.", ".kkk.", ".kyk.", ".kFk.", ".kkk.", "..c.."]);
  this.LSprites$__f_lanternA = new ($d_T.getArrayOf().constr)(["....c....", "...ccc...", "..ccccc..", ".ccccccc.", ".kkkkkkk.", ".kyykyyk.", ".kyFkFyk.", ".kyFkFyk.", ".kyykyyk.", ".kkkkkkk.", ".ccccccc.", "..ccccc..", "...ccc...", "....c...."]);
  this.LSprites$__f_lanternB = new ($d_T.getArrayOf().constr)(["....c....", "...ccc...", "..ccccc..", ".ccccccc.", ".kkkkkkk.", ".kyFkFyk.", ".kFFkFFk.", ".kyFkFyk.", ".kyykyyk.", ".kkkkkkk.", ".ccccccc.", "..ccccc..", "...ccc...", "....c...."]);
  this.LSprites$__f_coinA = new ($d_T.getArrayOf().constr)([".oooo.", "oOOOOo", "oOOOOo", "oOOOOo", "oOOOOo", ".oooo."]);
  this.LSprites$__f_coinB = new ($d_T.getArrayOf().constr)([".oooo.", "oOOBOo", "oOOBOo", "oOOOOo", "oOOOOo", ".oooo."]);
  this.LSprites$__f_catA = new ($d_T.getArrayOf().constr)(["..m......m..", ".mmmm....mm.", ".mMmm..mmmmm", "mmmmmmmmmmmm", ".mm.mm.mm...", ".m..m..m...."]);
  this.LSprites$__f_catB = new ($d_T.getArrayOf().constr)(["..m......m..", ".mmmm....mm.", ".mMmm..mmmmm", "mmmmmmmmmmmm", "mmm.mm.mm...", "..m..m..m..."]);
  this.LSprites$__f_catSit = new ($d_T.getArrayOf().constr)(["..m......m..", ".mmmmmmmmmm.", ".mgmmmmgmmm.", ".mmmmmmmmmm.", "mmmmmmmmmmmm", "mmmmmmmmmmmm", ".mmmmmmmmmm."]);
  this.LSprites$__f_foxA = new ($d_T.getArrayOf().constr)([".ff......ff...", ".ffff..ffff...", "ffffffffffff..", "Ffffffkfffff..", ".f.f..f.f.....", ".f.f..f.f....."]);
  this.LSprites$__f_foxB = new ($d_T.getArrayOf().constr)([".ff......ff...", ".ffff..ffff...", "ffffffffffff..", "Ffffffkfffff..", ".ff.mf.mf.....", "..f..f..f....."]);
  this.LSprites$__f_mothA = new ($d_T.getArrayOf().constr)([".w.", "wMw", ".w."]);
  this.LSprites$__f_mothB = new ($d_T.getArrayOf().constr)(["w.w", ".M.", "w.w"]);
  this.LSprites$__f_leaf = new ($d_T.getArrayOf().constr)(["ll.", "LLl", ".l."]);
  this.LSprites$__f_scale = 1.0;
}
$c_LSprites$.prototype = new $h_O();
$c_LSprites$.prototype.constructor = $c_LSprites$;
/** @constructor */
function $h_LSprites$() {
}
$h_LSprites$.prototype = $c_LSprites$.prototype;
$c_LSprites$.prototype.blit__sjs_js_Dynamic__AT__sci_Map__D__D__Z__D__V = (function(ctx, grid, pal, x0, y0, flip, alpha) {
  if ((alpha <= 0.01)) {
    return (void 0);
  }
  ctx.globalAlpha = alpha;
  var elem = 0;
  elem = 0;
  while ((elem < $n(grid).u.length)) {
    var row = $n(grid).get(elem);
    var elem$1 = 0;
    elem$1 = 0;
    while (true) {
      var $x_1 = elem$1;
      var this$4 = $n(row);
      if (($x_1 < this$4.length)) {
        var this$5 = $n(row);
        var index = elem$1;
        var ch = $charAt(this$5, index);
        if ((ch !== 46)) {
          var this$6 = $n($n(pal).get__O__s_Option($bC(ch)));
          if ((!this$6.isEmpty__Z())) {
            var x0$1 = this$6.get__O();
            var col = $as_T(x0$1);
            ctx.fillStyle = col;
            if (flip) {
              var this$8 = $n(row);
              var px = (x0 + (((((this$8.length - 1) | 0) - elem$1) | 0) * this.LSprites$__f_scale));
            } else {
              var px = (x0 + (elem$1 * this.LSprites$__f_scale));
            }
            var value = (y0 + (elem * this.LSprites$__f_scale));
            var value$1 = this.LSprites$__f_scale;
            var value$2 = this.LSprites$__f_scale;
            ctx.fillRect(px, value, value$1, value$2);
          }
        }
        elem$1 = ((1 + elem$1) | 0);
      } else {
        break;
      }
    }
    elem = ((1 + elem) | 0);
  }
  ctx.globalAlpha = 1.0;
});
$c_LSprites$.prototype.silhouette__sjs_js_Dynamic__AT__D__D__Z__T__D__V = (function(ctx, grid, x0, y0, flip, col, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = col;
  var j = 0;
  while ((j < $n(grid).u.length)) {
    var row = $n(grid).get(j);
    var i = 0;
    while (true) {
      var $x_1 = i;
      var this$3 = $n(row);
      if (($x_1 < this$3.length)) {
        var this$4 = $n(row);
        var index = i;
        if (($charAt(this$4, index) !== 46)) {
          if (flip) {
            var this$5 = $n(row);
            var px = (x0 + (((((this$5.length - 1) | 0) - i) | 0) * this.LSprites$__f_scale));
          } else {
            var px = (x0 + (i * this.LSprites$__f_scale));
          }
          var value = (y0 + (j * this.LSprites$__f_scale));
          var value$1 = this.LSprites$__f_scale;
          var value$2 = this.LSprites$__f_scale;
          ctx.fillRect(px, value, value$1, value$2);
        }
        i = ((1 + i) | 0);
      } else {
        break;
      }
    }
    j = ((1 + j) | 0);
  }
  ctx.globalAlpha = 1.0;
});
var $d_LSprites$ = new $TypeData().initClass($c_LSprites$, "Sprites$", ({
  LSprites$: 1
}));
var $n_LSprites$;
function $m_LSprites$() {
  if ((!$n_LSprites$)) {
    $n_LSprites$ = new $c_LSprites$();
  }
  return $n_LSprites$;
}
function $p_LWorld__lightTheWindow__V($thiz) {
  $thiz.LWorld__f_windowT = (26.0 + (10.0 * $n($thiz.LWorld__f_rng).nextDouble__D()));
  $n($thiz.LWorld__f_sound).insideRoom__V();
  var y = ($thiz.LWorld__f_pulse + 0.35);
  $thiz.LWorld__f_pulse = $uD(Math.min(1.0, y));
  var k = 0;
  while ((k < 6)) {
    var this$3 = $n($thiz.LWorld__f_particles);
    var elem = new $c_LP(($thiz.LWorld__f_windowX + (3.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), ($thiz.LWorld__f_windowY + 2.0), (2.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-2.0) - (3.0 * $n($thiz.LWorld__f_rng).nextDouble__D())), 2.0, 2.0, 6, 1.0);
    this$3.addOne__O__scm_ArrayBuffer(elem);
    k = ((1 + k) | 0);
  }
}
function $p_LWorld__knockOnTheDoor__V($thiz) {
  $n($thiz.LWorld__f_sound).knock__V();
  $thiz.LWorld__f_knocks = ((1 + $thiz.LWorld__f_knocks) | 0);
  if (($thiz.LWorld__f_knocks >= 3)) {
    $thiz.LWorld__f_knocks = 0;
    $thiz.LWorld__f_doorT = 60.0;
    $n($thiz.LWorld__f_sound).answered__V();
    var k = 0;
    while ((k < 10)) {
      var this$1 = $n($thiz.LWorld__f_particles);
      var elem = new $c_LP(($thiz.LWorld__f_doorX + (8.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), 528.0, (3.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-1.5) - (2.0 * $n($thiz.LWorld__f_rng).nextDouble__D())), 3.0, 3.0, 6, 1.0);
      this$1.addOne__O__scm_ArrayBuffer(elem);
      k = ((1 + k) | 0);
    }
  }
}
function $p_LWorld__coinAt__D__D__D__I($thiz, x, y, r) {
  var best = (-1);
  var bd = (r * r);
  var i = 0;
  while ((i < $n($thiz.LWorld__f_coins).u.length)) {
    if ((!$n($n($thiz.LWorld__f_coins).get(i)).LCoin__f_found)) {
      var dx = ($n($n($thiz.LWorld__f_coins).get(i)).LCoin__f_x - x);
      var dy = ($n($n($thiz.LWorld__f_coins).get(i)).LCoin__f_y - y);
      if ((((dx * dx) + (dy * dy)) < bd)) {
        bd = ((dx * dx) + (dy * dy));
        best = i;
      }
    }
    i = ((1 + i) | 0);
  }
  return best;
}
function $p_LWorld__petCat__V($thiz) {
  $thiz.LWorld__f_pets = ((1 + $thiz.LWorld__f_pets) | 0);
  $n($thiz.LWorld__f_sound).purr__V();
  $thiz.LWorld__f_catMode = 2;
  $thiz.LWorld__f_catCooldown = 150.0;
  $thiz.LWorld__f_cT = 0.0;
  var k = 0;
  while ((k < 8)) {
    var this$1 = $n($thiz.LWorld__f_particles);
    var elem = new $c_LP(($thiz.LWorld__f_cx + (5.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), ($thiz.LWorld__f_cy - 8.0), (3.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-6.0) - (4.0 * $n($thiz.LWorld__f_rng).nextDouble__D())), 2.0, 2.0, 5, 1.0);
    this$1.addOne__O__scm_ArrayBuffer(elem);
    k = ((1 + k) | 0);
  }
}
function $p_LWorld__ring__D__D__D__V($thiz, x, y, size) {
  var this$1 = $n($thiz.LWorld__f_particles);
  var elem = new $c_LP(x, y, 0.0, 0.0, 1.6, 1.6, 3, size);
  this$1.addOne__O__scm_ArrayBuffer(elem);
}
function $p_LWorld__clampX__D__D__D($thiz, x, y) {
  if ((y < 172.0)) {
    var \u03b42$___1 = null;
    var \u03b42$___2 = null;
    var \u03b42$___1$mcD$sp = 8.0;
    var \u03b42$___2$mcD$sp = 104.0;
  } else {
    var \u03b42$___1 = null;
    var \u03b42$___2 = null;
    var \u03b42$___1$mcD$sp = 35.0;
    var \u03b42$___2$mcD$sp = 77.0;
  }
  var lo = \u03b42$___1$mcD$sp;
  var hi = \u03b42$___2$mcD$sp;
  var y$1 = $uD(Math.min(hi, x));
  return $uD(Math.max(lo, y$1));
}
function $p_LWorld__inCorridor__D__Z($thiz, x) {
  return ((x >= 36.5) && (x <= 75.5));
}
function $p_LWorld__walk__D__V($thiz, dt) {
  var dx = ($thiz.LWorld__f_tx - $thiz.LWorld__f_wx);
  var dy = ($thiz.LWorld__f_ty - $thiz.LWorld__f_wy);
  var d = $m_jl_Math$().hypot__D__D__D(dx, dy);
  if ((d > 1.2)) {
    var ux = (dx / d);
    var uy = (dy / d);
    var nyt = ($thiz.LWorld__f_wy + ((26.0 * uy) * dt));
    if ((nyt > 846.0)) {
      nyt = 846.0;
    }
    if ((nyt < 58.0)) {
      nyt = 58.0;
    }
    if (((($thiz.LWorld__f_wy < 172.0) && (nyt >= 172.0)) && (!$p_LWorld__inCorridor__D__Z($thiz, $thiz.LWorld__f_wx)))) {
      nyt = $thiz.LWorld__f_wy;
    }
    $thiz.LWorld__f_wy = nyt;
    $thiz.LWorld__f_wx = $p_LWorld__clampX__D__D__D($thiz, ($thiz.LWorld__f_wx + ((26.0 * ux) * dt)), $thiz.LWorld__f_wy);
    if (($uD(Math.abs(ux)) > $uD(Math.abs(uy)))) {
      $thiz.LWorld__f_facing = ((ux > 0.0) ? 3 : 2);
    } else {
      $thiz.LWorld__f_facing = ((uy > 0.0) | 0);
    }
    $thiz.LWorld__f_lastDir = $thiz.LWorld__f_facing;
    $thiz.LWorld__f_walking = true;
    $thiz.LWorld__f_animT = ($thiz.LWorld__f_animT + (7.0 * dt));
    $thiz.LWorld__f_bobT = ($thiz.LWorld__f_bobT + (7.0 * dt));
    $thiz.LWorld__f_stepT = ($thiz.LWorld__f_stepT - dt);
    if (($thiz.LWorld__f_stepT <= 0.0)) {
      $thiz.LWorld__f_stepT = 0.4;
      $n($thiz.LWorld__f_sound).step__V();
      var fpx = ((($thiz.LWorld__f_facing === 2) || ($thiz.LWorld__f_facing === 3)) ? ($thiz.LWorld__f_wx + (($thiz.LWorld__f_facing === 2) ? 4 : (-4))) : $thiz.LWorld__f_wx);
      var this$6 = $n($thiz.LWorld__f_particles);
      var elem = new $c_LP(fpx, ($thiz.LWorld__f_wy + 1.0), 0.0, 0.0, 7.0, 7.0, 4, 1.0);
      this$6.addOne__O__scm_ArrayBuffer(elem);
      if ((($thiz.LWorld__f_facing === 0) || ($thiz.LWorld__f_facing === 1))) {
        var this$7 = $n($thiz.LWorld__f_particles);
        var elem$1 = new $c_LP(($thiz.LWorld__f_wx + (2.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), ($thiz.LWorld__f_wy + (($thiz.LWorld__f_facing === 0) ? (-1) : 2)), 0.0, 0.0, 7.0, 7.0, 4, 1.0);
        this$7.addOne__O__scm_ArrayBuffer(elem$1);
      }
    }
    var x = ($thiz.LWorld__f_wx - $thiz.LWorld__f_puddleX);
    var y = ($thiz.LWorld__f_wy - $thiz.LWorld__f_puddleY);
    var pd = $m_jl_Math$().hypot__D__D__D(x, y);
    if (((pd < 17.0) && ($thiz.LWorld__f_splashCool <= 0.0))) {
      $thiz.LWorld__f_splashCool = 1.6;
      $n($thiz.LWorld__f_sound).ripple__V();
      $p_LWorld__ring__D__D__D__V($thiz, ($thiz.LWorld__f_puddleX + (8.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), $thiz.LWorld__f_puddleY, 0.5);
    }
  } else {
    $thiz.LWorld__f_walking = false;
  }
}
function $p_LWorld__weather__D__V($thiz, dt) {
  if (($thiz.LWorld__f_rainHold > 0.0)) {
    $thiz.LWorld__f_rainHold = ($thiz.LWorld__f_rainHold - dt);
    $thiz.LWorld__f_wet = 0.0;
  } else {
    var y = ($thiz.LWorld__f_wet - (0.06 * dt));
    $thiz.LWorld__f_wet = $uD(Math.max(0.0, y));
  }
  var want = (($thiz.LWorld__f_rainHold > 0.0) ? 1.0 : 0.0);
  var $x_2 = $thiz.LWorld__f_rain;
  var $x_1 = $thiz.LWorld__f_rain;
  var y$1 = (0.22 * dt);
  $thiz.LWorld__f_rain = ($x_2 + ((want - $x_1) * $uD(Math.min(1.0, y$1))));
  if ((($thiz.LWorld__f_rain > 0.25) && ($n($thiz.LWorld__f_rng).nextDouble__D() < ((6.0 * dt) * $thiz.LWorld__f_rain)))) {
    var this$5 = $n($thiz.LWorld__f_particles);
    var elem = new $c_LP(($thiz.LWorld__f_puddleX + (14.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), ($thiz.LWorld__f_puddleY + (4.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), 0.0, 0.0, 1.3, 1.3, 3, 0.35);
    this$5.addOne__O__scm_ArrayBuffer(elem);
  }
  var i = 0;
  while (true) {
    var $x_3 = i;
    var this$6 = $n($thiz.LWorld__f_particles);
    if (($x_3 < this$6.scm_ArrayBuffer__f_size0)) {
      var p = $as_LP($n($thiz.LWorld__f_particles).apply__I__O(i));
      if ((($n(p).LP__f_kind === 2) && ($n(p).LP__f_life <= 0.0))) {
        $n($thiz.LWorld__f_particles).remove__I__O(i);
      } else {
        i = ((1 + i) | 0);
      }
    } else {
      break;
    }
  }
}
function $p_LWorld__lanternStep__D__V($thiz, dt) {
  var sum = 0.0;
  var i = 0;
  while ((i < $n($thiz.LWorld__f_lanterns).u.length)) {
    var l = $n($thiz.LWorld__f_lanterns).get(i);
    var decay = (($n(l).LLantern__f_steady ? 0.0026 : 0.0065) * (1.0 + (1.6 * $thiz.LWorld__f_rain)));
    var $x_1 = $n(l);
    var y = ($n(l).LLantern__f_warm - (dt * decay));
    $x_1.LLantern__f_warm = $uD(Math.max(0.0, y));
    if (($n(l).LLantern__f_warm < 0.03)) {
      $n(l).LLantern__f_steady = false;
      $n(l).LLantern__f_hue = 0.0;
    }
    $n(l).LLantern__f_swayV = ($n(l).LLantern__f_swayV + (((9.0 * (-$n(l).LLantern__f_sway)) - (1.6 * $n(l).LLantern__f_swayV)) * dt));
    $n(l).LLantern__f_sway = ($n(l).LLantern__f_sway + ($n(l).LLantern__f_swayV * dt));
    var $x_2 = $n(l);
    var y$1 = ($n(l).LLantern__f_flick - (1.6 * dt));
    $x_2.LLantern__f_flick = $uD(Math.max(0.0, y$1));
    sum = (sum + $n(l).LLantern__f_warm);
    i = ((1 + i) | 0);
  }
  $thiz.LWorld__f_warmth = (sum / $n($thiz.LWorld__f_lanterns).u.length);
  var g = 0;
  while ((g < $n($thiz.LWorld__f_lanterns).u.length)) {
    var l$2 = $n($thiz.LWorld__f_lanterns).get(g);
    if ((($n(l$2).LLantern__f_warm > 0.45) && ($n($thiz.LWorld__f_rng).nextDouble__D() < ((0.6 * dt) * $n(l$2).LLantern__f_warm)))) {
      var this$5 = $n($thiz.LWorld__f_particles);
      var elem = new $c_LP(($n(l$2).LLantern__f_x + (4.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), ($n(l$2).LLantern__f_y + 3.0), (1.2 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-1.4) - $n($thiz.LWorld__f_rng).nextDouble__D()), 3.0, 3.0, 5, 1.0);
      this$5.addOne__O__scm_ArrayBuffer(elem);
    }
    g = ((1 + g) | 0);
  }
}
function $p_LWorld__coinsStep__D__V($thiz, dt) {
  var i = 0;
  while ((i < $n($thiz.LWorld__f_coins).u.length)) {
    var c = $n($thiz.LWorld__f_coins).get(i);
    if ((!$n(c).LCoin__f_found)) {
      $n(c).LCoin__f_bob = ($n(c).LCoin__f_bob + dt);
      var lit = $thiz.lightAt__D__D__D($n(c).LCoin__f_x, $n(c).LCoin__f_y);
      if ((lit > 0.14)) {
        var x = ($n(c).LCoin__f_x - $thiz.LWorld__f_wx);
        var y = ($n(c).LCoin__f_y - $thiz.LWorld__f_wy);
        var $x_1 = ($m_jl_Math$().hypot__D__D__D(x, y) < 10.5);
      } else {
        var $x_1 = false;
      }
      if ($x_1) {
        $n(c).LCoin__f_found = true;
        $thiz.LWorld__f_coinsFound = ((1 + $thiz.LWorld__f_coinsFound) | 0);
        $n($thiz.LWorld__f_sound).coin__I__V((($thiz.LWorld__f_coinsFound - 1) | 0));
        var y$1 = ($thiz.LWorld__f_pulse + 0.6);
        $thiz.LWorld__f_pulse = $uD(Math.min(1.0, y$1));
        var k = 0;
        while ((k < 16)) {
          var this$4 = $n($thiz.LWorld__f_particles);
          var elem = new $c_LP($n(c).LCoin__f_x, $n(c).LCoin__f_y, (7.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-5.0) - (9.0 * $n($thiz.LWorld__f_rng).nextDouble__D())), 1.4, 1.4, 0, 1.0);
          this$4.addOne__O__scm_ArrayBuffer(elem);
          k = ((1 + k) | 0);
        }
        if (($thiz.LWorld__f_coinsFound >= 3)) {
          $thiz.LWorld__f_revealT = 0.0;
          $n($thiz.LWorld__f_sound).reveal__V();
        }
      }
    }
    i = ((1 + i) | 0);
  }
}
function $p_LWorld__windowStep__D__V($thiz, dt) {
  if (($thiz.LWorld__f_windowT > 0.0)) {
    $thiz.LWorld__f_windowT = ($thiz.LWorld__f_windowT - dt);
    var y = ($thiz.LWorld__f_windowLit + (0.8 * dt));
    $thiz.LWorld__f_windowLit = $uD(Math.min(1.0, y));
  } else {
    var y$1 = ($thiz.LWorld__f_windowLit - (0.12 * dt));
    $thiz.LWorld__f_windowLit = $uD(Math.max(0.0, y$1));
  }
  if (($thiz.LWorld__f_doorT > 0.0)) {
    $thiz.LWorld__f_doorT = ($thiz.LWorld__f_doorT - dt);
    var y$2 = ($thiz.LWorld__f_doorLight + (0.5 * dt));
    $thiz.LWorld__f_doorLight = $uD(Math.min(1.0, y$2));
  } else {
    var y$3 = ($thiz.LWorld__f_doorLight - (0.08 * dt));
    $thiz.LWorld__f_doorLight = $uD(Math.max(0.0, y$3));
  }
  var y$4 = ($thiz.LWorld__f_hissCool - dt);
  $thiz.LWorld__f_hissCool = $uD(Math.max(0.0, y$4));
  if ((($thiz.LWorld__f_rain > 0.25) && ($thiz.LWorld__f_hissCool <= 0.0))) {
    var i = 0;
    while ((i < $n($thiz.LWorld__f_lanterns).u.length)) {
      var l = $n($thiz.LWorld__f_lanterns).get(i);
      if ((($n(l).LLantern__f_warm > 0.35) && ($n($thiz.LWorld__f_rng).nextDouble__D() < 0.35))) {
        $thiz.LWorld__f_hissCool = (3.5 + (3.0 * $n($thiz.LWorld__f_rng).nextDouble__D()));
        $n($thiz.LWorld__f_sound).hiss__V();
        var k = 0;
        while ((k < 3)) {
          var this$11 = $n($thiz.LWorld__f_particles);
          var elem = new $c_LP(($n(l).LLantern__f_x + (4.0 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0))), ($n(l).LLantern__f_y + 2.0), (1.6 * ((2.0 * $n($thiz.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-3.0) - (3.0 * $n($thiz.LWorld__f_rng).nextDouble__D())), 2.6, 2.6, 6, 1.0);
          this$11.addOne__O__scm_ArrayBuffer(elem);
          k = ((1 + k) | 0);
        }
      }
      i = ((1 + i) | 0);
    }
  }
}
function $p_LWorld__catStep__D__V($thiz, dt) {
  if (($thiz.LWorld__f_catMode === 0)) {
    var y = (0.6 * $thiz.LWorld__f_pets);
    var patience = (6.5 - $uD(Math.min(3.5, y)));
    if (((((($thiz.LWorld__f_idleT > patience) && (!$thiz.LWorld__f_walking)) && ($thiz.LWorld__f_catCooldown <= 0.0)) && ($thiz.LWorld__f_rain < 0.4)) && ($thiz.LWorld__f_wy < 800.0))) {
      $thiz.LWorld__f_catMode = 1;
      $thiz.LWorld__f_cx = 32.0;
      $thiz.LWorld__f_cy = ($thiz.LWorld__f_catSitY + (0.0 * ($thiz.LWorld__f_wy - $thiz.LWorld__f_catSitY)));
      $thiz.LWorld__f_ctarget = $thiz.LWorld__f_catSitX;
      $thiz.LWorld__f_cdir = 1;
      $thiz.LWorld__f_cT = 0.0;
    }
  } else if (($thiz.LWorld__f_catMode === 1)) {
    $thiz.LWorld__f_cx = ($thiz.LWorld__f_cx + (12.0 * dt));
    if (($thiz.LWorld__f_cx >= $thiz.LWorld__f_ctarget)) {
      $thiz.LWorld__f_catMode = 2;
      $thiz.LWorld__f_cx = $thiz.LWorld__f_ctarget;
      $thiz.LWorld__f_cT = 0.0;
    }
  } else if (($thiz.LWorld__f_catMode === 2)) {
    $thiz.LWorld__f_cT = ($thiz.LWorld__f_cT + dt);
    if (($thiz.LWorld__f_cT > 26.0)) {
      $thiz.LWorld__f_catMode = 4;
      $thiz.LWorld__f_ctarget = 120.0;
    }
  } else if (($thiz.LWorld__f_catMode === 4)) {
    $thiz.LWorld__f_cx = ($thiz.LWorld__f_cx + (13.0 * dt));
    if (($thiz.LWorld__f_cx > 116.0)) {
      $thiz.LWorld__f_catMode = 0;
      $thiz.LWorld__f_catCooldown = (40.0 + (40.0 * $n($thiz.LWorld__f_rng).nextDouble__D()));
    }
  }
  if (((($thiz.LWorld__f_catMode === 2) && ($thiz.LWorld__f_pets > 0)) && $thiz.LWorld__f_walking)) {
    var x = ($thiz.LWorld__f_cx - $thiz.LWorld__f_wx);
    var y$1 = ($thiz.LWorld__f_cy - $thiz.LWorld__f_wy);
    var $x_1 = ($m_jl_Math$().hypot__D__D__D(x, y$1) > 30.0);
  } else {
    var $x_1 = false;
  }
  if (($x_1 && ($thiz.LWorld__f_cT > 2.0))) {
    var dx = ($thiz.LWorld__f_wx - $thiz.LWorld__f_cx);
    var dy = (($thiz.LWorld__f_wy - 8.0) - $thiz.LWorld__f_cy);
    var y$2 = $m_jl_Math$().hypot__D__D__D(dx, dy);
    var d = $uD(Math.max(1.0, y$2));
    $thiz.LWorld__f_cx = ($thiz.LWorld__f_cx + ((15.0 * (dx / d)) * dt));
    $thiz.LWorld__f_cy = ($thiz.LWorld__f_cy + ((15.0 * (dy / d)) * dt));
    $thiz.LWorld__f_cdir = ((dx > 0.0) ? 1 : (-1));
    if ((d < 7.0)) {
      $thiz.LWorld__f_cy = ($thiz.LWorld__f_wy - 8.0);
      $thiz.LWorld__f_cT = ($thiz.LWorld__f_cT + (0.4 * dt));
    }
  }
}
function $p_LWorld__foxStep__D__V($thiz, dt) {
  if (($thiz.LWorld__f_foxMode === 0)) {
    if (((($thiz.LWorld__f_idleT > 38.0) && ($thiz.LWorld__f_warmth > 0.35)) && ($thiz.LWorld__f_foxCooldown <= 0.0))) {
      $thiz.LWorld__f_foxMode = 1;
      var y = ($thiz.LWorld__f_wy - 40.0);
      var y$1 = $uD(Math.min(780.0, y));
      $thiz.LWorld__f_fy = $uD(Math.max(200.0, y$1));
      $thiz.LWorld__f_fx = 30.0;
      $thiz.LWorld__f_foxT = 0.0;
    }
  } else if (($thiz.LWorld__f_foxMode === 1)) {
    $thiz.LWorld__f_fx = ($thiz.LWorld__f_fx + (17.0 * dt));
    if (($thiz.LWorld__f_fx >= 86.0)) {
      $thiz.LWorld__f_foxMode = 2;
      $thiz.LWorld__f_foxT = 0.0;
    }
  } else if (($thiz.LWorld__f_foxMode === 2)) {
    $thiz.LWorld__f_foxT = ($thiz.LWorld__f_foxT + dt);
    if (($thiz.LWorld__f_foxT > 5.0)) {
      $thiz.LWorld__f_foxMode = 3;
    }
  } else if (($thiz.LWorld__f_foxMode === 3)) {
    $thiz.LWorld__f_fx = ($thiz.LWorld__f_fx - (21.0 * dt));
    if (($thiz.LWorld__f_fx < 24.0)) {
      $thiz.LWorld__f_foxMode = 0;
      $thiz.LWorld__f_foxCooldown = 220.0;
    }
  }
}
function $p_LWorld__revealStep__D__V($thiz, dt) {
  if (($thiz.LWorld__f_revealT < 0.0)) {
    return (void 0);
  }
  $thiz.LWorld__f_revealT = ($thiz.LWorld__f_revealT + dt);
  if (($thiz.LWorld__f_revealT < 9.0)) {
    $thiz.LWorld__f_ghostY = (($thiz.LWorld__f_wellY - 6.0) - (7.0 * $thiz.LWorld__f_revealT));
    var y = (0.9 * $thiz.LWorld__f_revealT);
    var $x_1 = $uD(Math.min(1.0, y));
    var y$1 = (1.0 - ($thiz.LWorld__f_revealT / 9.0));
    $thiz.LWorld__f_ghostA = ($x_1 * $uD(Math.max(0.0, y$1)));
  } else {
    $thiz.LWorld__f_ghostA = 0.0;
  }
}
function $p_LWorld__particlesStep__D__V($thiz, dt) {
  var i = 0;
  while (true) {
    var $x_7 = i;
    var this$1 = $n($thiz.LWorld__f_particles);
    if (($x_7 < this$1.scm_ArrayBuffer__f_size0)) {
      var p = $as_LP($n($thiz.LWorld__f_particles).apply__I__O(i));
      $n(p).LP__f_life = ($n(p).LP__f_life - dt);
      var x1 = $n(p).LP__f_kind;
      switch (x1) {
        case 0: {
          $n(p).LP__f_vy = ($n(p).LP__f_vy + (12.0 * dt));
          $n(p).LP__f_x = ($n(p).LP__f_x + ($n(p).LP__f_vx * dt));
          $n(p).LP__f_y = ($n(p).LP__f_y + ($n(p).LP__f_vy * dt));
          break;
        }
        case 1: {
          $n(p).LP__f_vy = ($n(p).LP__f_vy + (16.0 * dt));
          $n(p).LP__f_vx = ($n(p).LP__f_vx * (1.0 - (1.2 * dt)));
          $n(p).LP__f_x = ($n(p).LP__f_x + ($n(p).LP__f_vx * dt));
          $n(p).LP__f_y = ($n(p).LP__f_y + ($n(p).LP__f_vy * dt));
          break;
        }
        case 3: {
          $n(p).LP__f_size = ($n(p).LP__f_size + (1.4 * dt));
          break;
        }
        case 5: {
          $n(p).LP__f_vy = ($n(p).LP__f_vy + (1.6 * dt));
          var $x_3 = $n(p);
          var $x_2 = $n(p).LP__f_x;
          var $x_1 = $n(p).LP__f_vx;
          var x = ((2.0 * $thiz.LWorld__f_time) + $n(p).LP__f_y);
          $x_3.LP__f_x = ($x_2 + (($x_1 * dt) + (3.0 * ($uD(Math.sin(x)) * dt))));
          $n(p).LP__f_y = ($n(p).LP__f_y + ($n(p).LP__f_vy * dt));
          break;
        }
        case 6: {
          $n(p).LP__f_vy = ($n(p).LP__f_vy + (0.6 * dt));
          $n(p).LP__f_vx = ($n(p).LP__f_vx * (1.0 - (0.7 * dt)));
          var $x_6 = $n(p);
          var $x_5 = $n(p).LP__f_x;
          var $x_4 = $n(p).LP__f_vx;
          var x$1 = ((1.7 * $thiz.LWorld__f_time) + $n(p).LP__f_y);
          $x_6.LP__f_x = ($x_5 + (($x_4 * dt) + (2.0 * ($uD(Math.sin(x$1)) * dt))));
          $n(p).LP__f_y = ($n(p).LP__f_y + ($n(p).LP__f_vy * dt));
          break;
        }
      }
      if (($n(p).LP__f_life <= 0.0)) {
        $n($thiz.LWorld__f_particles).remove__I__O(i);
      } else {
        i = ((1 + i) | 0);
      }
    } else {
      break;
    }
  }
}
/** @constructor */
function $c_LWorld(sound) {
  this.LWorld__f_sound = null;
  this.LWorld__f_W = 0;
  this.LWorld__f_H = 0;
  this.LWorld__f_VIEW_W = 0;
  this.LWorld__f_VIEW_H = 0;
  this.LWorld__f_rng = null;
  this.LWorld__f_lanterns = null;
  this.LWorld__f_coins = null;
  this.LWorld__f_windowX = 0.0;
  this.LWorld__f_windowY = 0.0;
  this.LWorld__f_doorX = 0.0;
  this.LWorld__f_doorY = 0.0;
  this.LWorld__f_wellX = 0.0;
  this.LWorld__f_wellY = 0.0;
  this.LWorld__f_puddleX = 0.0;
  this.LWorld__f_puddleY = 0.0;
  this.LWorld__f_catSitX = 0.0;
  this.LWorld__f_catSitY = 0.0;
  this.LWorld__f_lanternTended = 0;
  this.LWorld__f_wx = 0.0;
  this.LWorld__f_wy = 0.0;
  this.LWorld__f_tx = 0.0;
  this.LWorld__f_ty = 0.0;
  this.LWorld__f_facing = 0;
  this.LWorld__f_walking = false;
  this.LWorld__f_animT = 0.0;
  this.LWorld__f_stepT = 0.0;
  this.LWorld__f_bobT = 0.0;
  this.LWorld__f_splashCool = 0.0;
  this.LWorld__f_camY = 0.0;
  this.LWorld__f_camTarget = 0.0;
  this.LWorld__f_time = 0.0;
  this.LWorld__f_rain = 0.0;
  this.LWorld__f_rainHold = 0.0;
  this.LWorld__f_wet = 0.0;
  this.LWorld__f_pulse = 0.0;
  this.LWorld__f_warmth = 0.0;
  this.LWorld__f_idleT = 0.0;
  this.LWorld__f_inputT = 0.0;
  this.LWorld__f_coinsFound = 0;
  this.LWorld__f_revealT = 0.0;
  this.LWorld__f_windowLit = 0.0;
  this.LWorld__f_windowT = 0.0;
  this.LWorld__f_knocks = 0;
  this.LWorld__f_doorLight = 0.0;
  this.LWorld__f_doorT = 0.0;
  this.LWorld__f_hissCool = 0.0;
  this.LWorld__f_chordPlayed = false;
  this.LWorld__f_particles = null;
  this.LWorld__f_catMode = 0;
  this.LWorld__f_cx = 0.0;
  this.LWorld__f_cy = 0.0;
  this.LWorld__f_ctarget = 0.0;
  this.LWorld__f_cdir = 0;
  this.LWorld__f_cT = 0.0;
  this.LWorld__f_pets = 0;
  this.LWorld__f_catCooldown = 0.0;
  this.LWorld__f_foxMode = 0;
  this.LWorld__f_fx = 0.0;
  this.LWorld__f_fy = 0.0;
  this.LWorld__f_foxT = 0.0;
  this.LWorld__f_foxCooldown = 0.0;
  this.LWorld__f_ghostY = 0.0;
  this.LWorld__f_ghostA = 0.0;
  this.LWorld__f_lastDir = 0;
  this.LWorld__f_render = null;
  this.LWorld__f_sound = sound;
  this.LWorld__f_W = 112;
  this.LWorld__f_H = 900;
  this.LWorld__f_VIEW_W = 112;
  this.LWorld__f_VIEW_H = 300;
  this.LWorld__f_rng = new $c_ju_Random(11, 0);
  this.LWorld__f_lanterns = new ($d_LLantern.getArrayOf().constr)([new $c_LLantern(36.0, 220.0), new $c_LLantern(76.0, 300.0), new $c_LLantern(36.0, 400.0), new $c_LLantern(76.0, 490.0), new $c_LLantern(36.0, 590.0), new $c_LLantern(76.0, 680.0), new $c_LLantern(28.0, 104.0)]);
  this.LWorld__f_coins = new ($d_LCoin.getArrayOf().constr)([new $c_LCoin(44.0, 380.0), new $c_LCoin(70.0, 660.0), new $c_LCoin(40.0, 110.0)]);
  this.LWorld__f_windowX = 28.0;
  this.LWorld__f_windowY = 270.0;
  this.LWorld__f_doorX = 85.0;
  this.LWorld__f_doorY = 513.0;
  this.LWorld__f_wellX = 62.0;
  this.LWorld__f_wellY = 130.0;
  this.LWorld__f_puddleX = 60.0;
  this.LWorld__f_puddleY = 560.0;
  this.LWorld__f_catSitX = 66.0;
  this.LWorld__f_catSitY = 236.0;
  this.LWorld__f_lanternTended = 0;
  this.LWorld__f_wx = 56.0;
  this.LWorld__f_wy = 790.0;
  this.LWorld__f_tx = 56.0;
  this.LWorld__f_ty = 790.0;
  this.LWorld__f_facing = 0;
  this.LWorld__f_walking = false;
  this.LWorld__f_animT = 0.0;
  this.LWorld__f_stepT = 0.0;
  this.LWorld__f_bobT = 0.0;
  this.LWorld__f_splashCool = 0.0;
  this.LWorld__f_camY = 610.0;
  this.LWorld__f_camTarget = 610.0;
  this.LWorld__f_time = 0.0;
  this.LWorld__f_rain = 0.0;
  this.LWorld__f_rainHold = 0.0;
  this.LWorld__f_wet = 0.0;
  this.LWorld__f_pulse = 0.0;
  this.LWorld__f_warmth = 0.0;
  this.LWorld__f_idleT = 0.0;
  this.LWorld__f_inputT = 0.0;
  this.LWorld__f_coinsFound = 0;
  this.LWorld__f_revealT = (-1.0);
  this.LWorld__f_windowLit = 0.0;
  this.LWorld__f_windowT = 0.0;
  this.LWorld__f_knocks = 0;
  this.LWorld__f_doorLight = 0.0;
  this.LWorld__f_doorT = 0.0;
  this.LWorld__f_hissCool = 0.0;
  this.LWorld__f_chordPlayed = false;
  this.LWorld__f_particles = $ct_scm_ArrayBuffer__(new $c_scm_ArrayBuffer());
  this.LWorld__f_catMode = 0;
  this.LWorld__f_cx = (-20.0);
  this.LWorld__f_cy = 236.0;
  this.LWorld__f_ctarget = (-20.0);
  this.LWorld__f_cdir = 1;
  this.LWorld__f_cT = 0.0;
  this.LWorld__f_pets = 0;
  this.LWorld__f_catCooldown = 0.0;
  this.LWorld__f_foxMode = 0;
  this.LWorld__f_fx = (-30.0);
  this.LWorld__f_fy = 0.0;
  this.LWorld__f_foxT = 0.0;
  this.LWorld__f_foxCooldown = 120.0;
  this.LWorld__f_ghostY = 0.0;
  this.LWorld__f_ghostA = 0.0;
  this.LWorld__f_lastDir = 3;
  this.LWorld__f_render = new $c_LRender(this);
}
$c_LWorld.prototype = new $h_O();
$c_LWorld.prototype.constructor = $c_LWorld;
/** @constructor */
function $h_LWorld() {
}
$h_LWorld.prototype = $c_LWorld.prototype;
$c_LWorld.prototype.lanternAt__D__D__D__I = (function(x, y, r) {
  var best = (-1);
  var bd = (r * r);
  var i = 0;
  while ((i < $n(this.LWorld__f_lanterns).u.length)) {
    var l = $n(this.LWorld__f_lanterns).get(i);
    var dx = ($n(l).LLantern__f_x - x);
    var dy = ($n(l).LLantern__f_y - y);
    var d = ((dx * dx) + (dy * dy));
    if ((d < bd)) {
      bd = d;
      best = i;
    }
    i = ((1 + i) | 0);
  }
  return best;
});
$c_LWorld.prototype.tapAt__D__D__V = (function(x, y) {
  this.LWorld__f_inputT = 0.0;
  var li = this.lanternAt__D__D__D__I(x, y, 13.0);
  if ((li >= 0)) {
    this.warmLantern__I__V(li);
    return (void 0);
  }
  if ((this.LWorld__f_catMode === 2)) {
    var x$1 = (this.LWorld__f_cx - x);
    var $x_2 = ($uD(Math.abs(x$1)) < 9.0);
  } else {
    var $x_2 = false;
  }
  if ($x_2) {
    var x$2 = (this.LWorld__f_cy - y);
    var $x_1 = ($uD(Math.abs(x$2)) < 8.0);
  } else {
    var $x_1 = false;
  }
  if ($x_1) {
    $p_LWorld__petCat__V(this);
    return (void 0);
  }
  var x$3 = (x - this.LWorld__f_wellX);
  var y$1 = (y - this.LWorld__f_wellY);
  if (($m_jl_Math$().hypot__D__D__D(x$3, y$1) < 15.0)) {
    $n(this.LWorld__f_sound).ripple__V();
    $p_LWorld__ring__D__D__D__V(this, this.LWorld__f_wellX, (this.LWorld__f_wellY - 4.0), 0.9);
    return (void 0);
  }
  var x$4 = (x - this.LWorld__f_windowX);
  var y$2 = (y - this.LWorld__f_windowY);
  if (($m_jl_Math$().hypot__D__D__D(x$4, y$2) < 15.0)) {
    $p_LWorld__lightTheWindow__V(this);
    return (void 0);
  }
  var x$5 = (x - this.LWorld__f_doorX);
  var y$3 = (y - this.LWorld__f_doorY);
  if (($m_jl_Math$().hypot__D__D__D(x$5, y$3) < 16.0)) {
    $p_LWorld__knockOnTheDoor__V(this);
    return (void 0);
  }
  this.LWorld__f_tx = $p_LWorld__clampX__D__D__D(this, x, y);
  var y$4 = $uD(Math.min(846.0, y));
  this.LWorld__f_ty = $uD(Math.max(58.0, y$4));
  this.LWorld__f_lastDir = ((this.LWorld__f_ty < (this.LWorld__f_wy - 2.0)) ? 0 : ((this.LWorld__f_ty > (this.LWorld__f_wy + 2.0)) ? 1 : this.LWorld__f_lastDir));
});
$c_LWorld.prototype.longPressAt__D__D__V = (function(x, y) {
  this.LWorld__f_inputT = 0.0;
  var li = this.lanternAt__D__D__D__I(x, y, 15.0);
  if ((li >= 0)) {
    this.tendLantern__I__V(li);
    return (void 0);
  }
  if ((this.LWorld__f_catMode === 2)) {
    var x$1 = (this.LWorld__f_cx - x);
    var $x_1 = ($uD(Math.abs(x$1)) < 10.0);
  } else {
    var $x_1 = false;
  }
  if ($x_1) {
    $p_LWorld__petCat__V(this);
    return (void 0);
  }
  var ci = $p_LWorld__coinAt__D__D__D__I(this, x, y, 12.0);
  if ((ci >= 0)) {
    $n(this.LWorld__f_sound).ripple__V();
    $p_LWorld__ring__D__D__D__V(this, $n($n(this.LWorld__f_coins).get(ci)).LCoin__f_x, $n($n(this.LWorld__f_coins).get(ci)).LCoin__f_y, 0.7);
  }
});
$c_LWorld.prototype.dragTo__D__D__V = (function(x, y) {
  this.LWorld__f_inputT = 0.0;
  this.LWorld__f_tx = $p_LWorld__clampX__D__D__D(this, x, y);
  var y$1 = $uD(Math.min(846.0, y));
  this.LWorld__f_ty = $uD(Math.max(58.0, y$1));
  this.LWorld__f_lastDir = ((this.LWorld__f_ty < (this.LWorld__f_wy - 2.0)) ? 0 : ((this.LWorld__f_ty > (this.LWorld__f_wy + 2.0)) ? 1 : this.LWorld__f_lastDir));
});
$c_LWorld.prototype.gust__D__V = (function(dirX) {
  this.LWorld__f_inputT = 0.0;
  $n(this.LWorld__f_sound).gust__V();
  this.LWorld__f_wet = (this.LWorld__f_wet + 0.95);
  var i = 0;
  while ((i < $n(this.LWorld__f_lanterns).u.length)) {
    var \u03b41$ = $n(this.LWorld__f_lanterns).get(i);
    $n(\u03b41$).LLantern__f_swayV = ($n(\u03b41$).LLantern__f_swayV + (2.4 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0)));
    i = ((1 + i) | 0);
  }
  i = 0;
  while ((i < 7)) {
    var this$1 = $n(this.LWorld__f_particles);
    var elem = new $c_LP((this.LWorld__f_wx + (30.0 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0))), (this.LWorld__f_wy + (40.0 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0))), (dirX * (14.0 + (10.0 * $n(this.LWorld__f_rng).nextDouble__D()))), ((-8.0) - (10.0 * $n(this.LWorld__f_rng).nextDouble__D())), (3.4 + (1.6 * $n(this.LWorld__f_rng).nextDouble__D())), 5.0, 1, 1.0);
    this$1.addOne__O__scm_ArrayBuffer(elem);
    i = ((1 + i) | 0);
  }
  if (((this.LWorld__f_rainHold <= 0.0) && (this.LWorld__f_wet >= 1.7))) {
    this.LWorld__f_rainHold = (70.0 + (40.0 * $n(this.LWorld__f_rng).nextDouble__D()));
    this.LWorld__f_wet = 0.0;
  }
});
$c_LWorld.prototype.warmLantern__I__V = (function(i) {
  var l = $n(this.LWorld__f_lanterns).get(i);
  var $x_1 = $n(l);
  var y = ($n(l).LLantern__f_warm + 0.45);
  $x_1.LLantern__f_warm = $uD(Math.min(1.0, y));
  $n(l).LLantern__f_flick = 1.0;
  $n(this.LWorld__f_sound).warm__V();
  var y$1 = (this.LWorld__f_pulse + 0.75);
  this.LWorld__f_pulse = $uD(Math.min(1.0, y$1));
  var k = 0;
  while ((k < 10)) {
    var this$5 = $n(this.LWorld__f_particles);
    var elem = new $c_LP(($n(l).LLantern__f_x + (3.0 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0))), (($n(l).LLantern__f_y + 1.0) + (3.0 * $n(this.LWorld__f_rng).nextDouble__D())), (4.0 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0)), (3.0 + (7.0 * $n(this.LWorld__f_rng).nextDouble__D())), (1.1 + (0.9 * $n(this.LWorld__f_rng).nextDouble__D())), 2.0, 0, 1.0);
    this$5.addOne__O__scm_ArrayBuffer(elem);
    k = ((1 + k) | 0);
  }
});
$c_LWorld.prototype.tendLantern__I__V = (function(i) {
  var l = $n(this.LWorld__f_lanterns).get(i);
  var $x_1 = $n(l);
  var y = ($n(l).LLantern__f_warm + 0.75);
  $x_1.LLantern__f_warm = $uD(Math.min(1.0, y));
  $n(l).LLantern__f_flick = 1.0;
  if ((!$n(l).LLantern__f_steady)) {
    $n(l).LLantern__f_steady = true;
    this.LWorld__f_lanternTended = ((1 + this.LWorld__f_lanternTended) | 0);
  }
  $n(l).LLantern__f_hue = (($n(l).LLantern__f_hue > 0.4) ? (-0.6) : ($n(l).LLantern__f_hue + 0.7));
  $n(this.LWorld__f_sound).tend__V();
  var y$1 = (this.LWorld__f_pulse + 0.9);
  this.LWorld__f_pulse = $uD(Math.min(1.0, y$1));
  var k = 0;
  while ((k < 20)) {
    var this$5 = $n(this.LWorld__f_particles);
    var elem = new $c_LP(($n(l).LLantern__f_x + (4.0 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0))), ($n(l).LLantern__f_y + 2.0), (5.0 * ((2.0 * $n(this.LWorld__f_rng).nextDouble__D()) - 1.0)), ((-4.0) - (12.0 * $n(this.LWorld__f_rng).nextDouble__D())), (1.6 + (1.4 * $n(this.LWorld__f_rng).nextDouble__D())), 3.0, 0, 1.0);
    this$5.addOne__O__scm_ArrayBuffer(elem);
    k = ((1 + k) | 0);
  }
  if (((this.LWorld__f_lanternTended >= $n(this.LWorld__f_lanterns).u.length) && (!this.LWorld__f_chordPlayed))) {
    this.LWorld__f_chordPlayed = true;
    $n(this.LWorld__f_sound).reveal__V();
    this.LWorld__f_pulse = 1.0;
  }
});
$c_LWorld.prototype.lightAt__D__D__D = (function(x, y) {
  var a = 0.0;
  var i = 0;
  while ((i < $n(this.LWorld__f_lanterns).u.length)) {
    var l = $n(this.LWorld__f_lanterns).get(i);
    var x$1 = ($n(l).LLantern__f_x - x);
    var y$1 = ($n(l).LLantern__f_y - y);
    var d = $m_jl_Math$().hypot__D__D__D(x$1, y$1);
    var r = (32.0 + (18.0 * $n(l).LLantern__f_warm));
    if ((d < r)) {
      var x$2 = a;
      var y$2 = ($n(l).LLantern__f_warm * (1.0 - (d / r)));
      a = $uD(Math.max(x$2, y$2));
    }
    i = ((1 + i) | 0);
  }
  var x$3 = (this.LWorld__f_wx - x);
  var y$3 = (this.LWorld__f_wy - y);
  var dw = $m_jl_Math$().hypot__D__D__D(x$3, y$3);
  if ((dw < 26.0)) {
    var x$4 = a;
    var y$4 = (0.45 * (1.0 - (dw / 26.0)));
    a = $uD(Math.max(x$4, y$4));
  }
  if ((this.LWorld__f_revealT >= 0.0)) {
    var x$5 = a;
    a = $uD(Math.max(x$5, 0.6));
  }
  return a;
});
$c_LWorld.prototype.update__D__V = (function(dt) {
  this.LWorld__f_time = (this.LWorld__f_time + dt);
  this.LWorld__f_inputT = (this.LWorld__f_inputT + dt);
  this.LWorld__f_idleT = (this.LWorld__f_idleT + dt);
  if ((this.LWorld__f_inputT <= (dt + 0.001))) {
    this.LWorld__f_idleT = 0.0;
  }
  var y = (this.LWorld__f_pulse - (1.4 * dt));
  this.LWorld__f_pulse = $uD(Math.max(0.0, y));
  var y$1 = (this.LWorld__f_splashCool - dt);
  this.LWorld__f_splashCool = $uD(Math.max(0.0, y$1));
  var y$2 = (this.LWorld__f_catCooldown - dt);
  this.LWorld__f_catCooldown = $uD(Math.max(0.0, y$2));
  var y$3 = (this.LWorld__f_foxCooldown - dt);
  this.LWorld__f_foxCooldown = $uD(Math.max(0.0, y$3));
  var x = ((this.LWorld__f_H - this.LWorld__f_VIEW_H) | 0);
  var x$1 = x;
  var y$4 = (this.LWorld__f_wy - (0.6 * this.LWorld__f_VIEW_H));
  var y$5 = $uD(Math.min(x$1, y$4));
  this.LWorld__f_camTarget = $uD(Math.max(0.0, y$5));
  var $x_3 = this.LWorld__f_camY;
  var $x_2 = this.LWorld__f_camTarget;
  var $x_1 = this.LWorld__f_camY;
  var y$6 = (3.0 * dt);
  this.LWorld__f_camY = ($x_3 + (($x_2 - $x_1) * $uD(Math.min(1.0, y$6))));
  $p_LWorld__walk__D__V(this, dt);
  $p_LWorld__weather__D__V(this, dt);
  $p_LWorld__lanternStep__D__V(this, dt);
  $p_LWorld__coinsStep__D__V(this, dt);
  $p_LWorld__windowStep__D__V(this, dt);
  $p_LWorld__catStep__D__V(this, dt);
  $p_LWorld__foxStep__D__V(this, dt);
  $p_LWorld__revealStep__D__V(this, dt);
  $p_LWorld__particlesStep__D__V(this, dt);
  $n(this.LWorld__f_sound).sync__D__D__D__V(this.LWorld__f_warmth, this.LWorld__f_rain, dt);
});
$c_LWorld.prototype.coinVisible__I__D = (function(i) {
  var c = $n(this.LWorld__f_coins).get(i);
  if ($n(c).LCoin__f_found) {
    return 0.0;
  } else {
    var y = (2.4 * this.lightAt__D__D__D($n(c).LCoin__f_x, $n(c).LCoin__f_y));
    return $uD(Math.min(1.0, y));
  }
});
var $d_LWorld = new $TypeData().initClass($c_LWorld, "World", ({
  LWorld: 1
}));
/** @constructor */
function $c_jl_Math$() {
}
$c_jl_Math$.prototype = new $h_O();
$c_jl_Math$.prototype.constructor = $c_jl_Math$;
/** @constructor */
function $h_jl_Math$() {
}
$h_jl_Math$.prototype = $c_jl_Math$.prototype;
$c_jl_Math$.prototype.hypot__D__D__D = (function(a, b) {
  return $uD(Math.hypot(a, b));
});
var $d_jl_Math$ = new $TypeData().initClass($c_jl_Math$, "java.lang.Math$", ({
  jl_Math$: 1
}));
var $n_jl_Math$;
function $m_jl_Math$() {
  if ((!$n_jl_Math$)) {
    $n_jl_Math$ = new $c_jl_Math$();
  }
  return $n_jl_Math$;
}
function $p_jl_System$SystemProperties$__loadSystemProperties__O($thiz) {
  var result = ({});
  result["java.version"] = "1.8";
  result["java.vm.specification.version"] = "1.8";
  result["java.vm.specification.vendor"] = "Oracle Corporation";
  result["java.vm.specification.name"] = "Java Virtual Machine Specification";
  result["java.vm.name"] = "Scala.js";
  result["java.vm.version"] = "1.22.0";
  result["java.specification.version"] = "1.8";
  result["java.specification.vendor"] = "Oracle Corporation";
  result["java.specification.name"] = "Java Platform API Specification";
  result["file.separator"] = "/";
  result["path.separator"] = ":";
  result["line.separator"] = "\n";
  return result;
}
/** @constructor */
function $c_jl_System$SystemProperties$() {
  this.jl_System$SystemProperties$__f_dict = null;
  this.jl_System$SystemProperties$__f_properties = null;
  $n_jl_System$SystemProperties$ = this;
  this.jl_System$SystemProperties$__f_dict = $p_jl_System$SystemProperties$__loadSystemProperties__O(this);
  this.jl_System$SystemProperties$__f_properties = null;
}
$c_jl_System$SystemProperties$.prototype = new $h_O();
$c_jl_System$SystemProperties$.prototype.constructor = $c_jl_System$SystemProperties$;
/** @constructor */
function $h_jl_System$SystemProperties$() {
}
$h_jl_System$SystemProperties$.prototype = $c_jl_System$SystemProperties$.prototype;
$c_jl_System$SystemProperties$.prototype.getProperty__T__T__T = (function(key, default$1) {
  if ((this.jl_System$SystemProperties$__f_dict !== null)) {
    var dict = this.jl_System$SystemProperties$__f_dict;
    return $as_T(($uZ($m_jl_Utils$Cache$().jl_Utils$Cache$__f_safeHasOwnProperty.call(dict, key)) ? dict[key] : default$1));
  } else {
    return $n(this.jl_System$SystemProperties$__f_properties).getProperty__T__T__T(key, default$1);
  }
});
var $d_jl_System$SystemProperties$ = new $TypeData().initClass($c_jl_System$SystemProperties$, "java.lang.System$SystemProperties$", ({
  jl_System$SystemProperties$: 1
}));
var $n_jl_System$SystemProperties$;
function $m_jl_System$SystemProperties$() {
  if ((!$n_jl_System$SystemProperties$)) {
    $n_jl_System$SystemProperties$ = new $c_jl_System$SystemProperties$();
  }
  return $n_jl_System$SystemProperties$;
}
/** @constructor */
function $c_jl_Utils$Cache$() {
  this.jl_Utils$Cache$__f_safeHasOwnProperty = null;
  $n_jl_Utils$Cache$ = this;
  this.jl_Utils$Cache$__f_safeHasOwnProperty = Object.prototype.hasOwnProperty;
}
$c_jl_Utils$Cache$.prototype = new $h_O();
$c_jl_Utils$Cache$.prototype.constructor = $c_jl_Utils$Cache$;
/** @constructor */
function $h_jl_Utils$Cache$() {
}
$h_jl_Utils$Cache$.prototype = $c_jl_Utils$Cache$.prototype;
var $d_jl_Utils$Cache$ = new $TypeData().initClass($c_jl_Utils$Cache$, "java.lang.Utils$Cache$", ({
  jl_Utils$Cache$: 1
}));
var $n_jl_Utils$Cache$;
function $m_jl_Utils$Cache$() {
  if ((!$n_jl_Utils$Cache$)) {
    $n_jl_Utils$Cache$ = new $c_jl_Utils$Cache$();
  }
  return $n_jl_Utils$Cache$;
}
function $f_jl_Void__equals__O__Z($thiz, that) {
  return ($thiz === that);
}
function $f_jl_Void__hashCode__I($thiz) {
  return 0;
}
function $f_jl_Void__toString__T($thiz) {
  return "undefined";
}
function $as_jl_Void(obj) {
  return (((obj === (void 0)) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Void"));
}
function $isArrayOf_jl_Void(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Void)));
}
function $asArrayOf_jl_Void(obj, depth) {
  return (($isArrayOf_jl_Void(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Void;", depth));
}
var $d_jl_Void = new $TypeData().initClass(0, "java.lang.Void", ({
  jl_Void: 1
}), ((x) => (x === (void 0))));
function $p_jl_reflect_Array$__mismatch__O__E($thiz, array) {
  $n(array);
  throw $ct_jl_IllegalArgumentException__T__(new $c_jl_IllegalArgumentException(), "argument type mismatch");
}
/** @constructor */
function $c_jl_reflect_Array$() {
}
$c_jl_reflect_Array$.prototype = new $h_O();
$c_jl_reflect_Array$.prototype.constructor = $c_jl_reflect_Array$;
/** @constructor */
function $h_jl_reflect_Array$() {
}
$h_jl_reflect_Array$.prototype = $c_jl_reflect_Array$.prototype;
$c_jl_reflect_Array$.prototype.getLength__O__I = (function(array) {
  if ((array instanceof $ac_O)) {
    var x2 = $asArrayOf_O(array, 1);
    return $n(x2).u.length;
  } else if ((array instanceof $ac_Z)) {
    var x3 = $asArrayOf_Z(array, 1);
    return $n(x3).u.length;
  } else if ((array instanceof $ac_C)) {
    var x4 = $asArrayOf_C(array, 1);
    return $n(x4).u.length;
  } else if ((array instanceof $ac_B)) {
    var x5 = $asArrayOf_B(array, 1);
    return $n(x5).u.length;
  } else if ((array instanceof $ac_S)) {
    var x6 = $asArrayOf_S(array, 1);
    return $n(x6).u.length;
  } else if ((array instanceof $ac_I)) {
    var x7 = $asArrayOf_I(array, 1);
    return $n(x7).u.length;
  } else if ((array instanceof $ac_J)) {
    var x8 = $asArrayOf_J(array, 1);
    return (($n(x8).u.length >>> 1) | 0);
  } else if ((array instanceof $ac_F)) {
    var x9 = $asArrayOf_F(array, 1);
    return $n(x9).u.length;
  } else {
    if ((!(array instanceof $ac_D))) {
      $p_jl_reflect_Array$__mismatch__O__E(this, array);
    }
    var x10 = $asArrayOf_D(array, 1);
    return $n(x10).u.length;
  }
});
var $d_jl_reflect_Array$ = new $TypeData().initClass($c_jl_reflect_Array$, "java.lang.reflect.Array$", ({
  jl_reflect_Array$: 1
}));
var $n_jl_reflect_Array$;
function $m_jl_reflect_Array$() {
  if ((!$n_jl_reflect_Array$)) {
    $n_jl_reflect_Array$ = new $c_jl_reflect_Array$();
  }
  return $n_jl_reflect_Array$;
}
/** @constructor */
function $c_ju_Arrays$() {
}
$c_ju_Arrays$.prototype = new $h_O();
$c_ju_Arrays$.prototype.constructor = $c_ju_Arrays$;
/** @constructor */
function $h_ju_Arrays$() {
}
$h_ju_Arrays$.prototype = $c_ju_Arrays$.prototype;
$c_ju_Arrays$.prototype.binarySearch__AI__I__I = (function(a, key) {
  var startIndex = 0;
  var endIndex = $n(a).u.length;
  while (true) {
    if ((startIndex === endIndex)) {
      return (~startIndex);
    } else {
      var mid = ((((startIndex + endIndex) | 0) >>> 1) | 0);
      var elem = $n(a).get(mid);
      var cmp = ((key === elem) ? 0 : ((key < elem) ? (-1) : 1));
      if ((cmp < 0)) {
        endIndex = mid;
        continue;
      }
      if ((cmp !== 0)) {
        startIndex = ((1 + mid) | 0);
        continue;
      }
      return mid;
    }
  }
});
$c_ju_Arrays$.prototype.equals__AI__AI__Z = (function(a, b) {
  if ((a === b)) {
    return true;
  }
  if (((a === null) || (b === null))) {
    return false;
  }
  var len = $n(a).u.length;
  if (($n(b).u.length !== len)) {
    return false;
  }
  var i = 0;
  while ((i !== len)) {
    var i$1 = i;
    var a$1 = $n(a).get(i$1);
    var i$2 = i;
    var b$1 = $n(b).get(i$2);
    if ((!(a$1 === b$1))) {
      return false;
    }
    i = ((1 + i) | 0);
  }
  return true;
});
$c_ju_Arrays$.prototype.equals__AZ__AZ__Z = (function(a, b) {
  if ((a === b)) {
    return true;
  }
  if (((a === null) || (b === null))) {
    return false;
  }
  var len = $n(a).u.length;
  if (($n(b).u.length !== len)) {
    return false;
  }
  var i = 0;
  while ((i !== len)) {
    var i$1 = i;
    var a$1 = $n(a).get(i$1);
    var i$2 = i;
    var b$1 = $n(b).get(i$2);
    if ((!(a$1 === b$1))) {
      return false;
    }
    i = ((1 + i) | 0);
  }
  return true;
});
$c_ju_Arrays$.prototype.fill__AO__O__V = (function(a, value) {
  var toIndex = $n(a).u.length;
  var i = 0;
  while ((i !== toIndex)) {
    var i$1 = i;
    $n(a).set(i$1, value);
    i = ((1 + i) | 0);
  }
});
$c_ju_Arrays$.prototype.fill__AO__I__I__O__V = (function(a, fromIndex, toIndex, value) {
  if ((fromIndex > toIndex)) {
    throw $ct_jl_IllegalArgumentException__T__(new $c_jl_IllegalArgumentException(), (((("fromIndex(" + fromIndex) + ") > toIndex(") + toIndex) + ")"));
  }
  if ((fromIndex < 0)) {
    $n(a).get(fromIndex);
  }
  if ((toIndex > 0)) {
    var i = ((toIndex - 1) | 0);
    $n(a).get(i);
  }
  var i$1 = fromIndex;
  while ((i$1 !== toIndex)) {
    var i$2 = i$1;
    $n(a).set(i$2, value);
    i$1 = ((1 + i$1) | 0);
  }
});
$c_ju_Arrays$.prototype.copyOf__AO__I__AO = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var this$3 = $n(original);
  var clazz = $objectGetClass(this$3);
  var componentType = clazz.data.getComponentType();
  var ret = $asArrayOf_O($n(componentType).data.newArray(newLength), 1);
  $systemArraycopyRefs($n(original), 0, $n(ret), 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AO__I__jl_Class__AO = (function(original, newLength, newType) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var this$4 = $n(newType);
  var componentType = this$4.data.getComponentType();
  var ret = $asArrayOf_O($n(componentType).data.newArray(newLength), 1);
  $systemArraycopyRefs($n(original), 0, $n(ret), 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AB__I__AB = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_B(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AS__I__AS = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_S(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AI__I__AI = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_I(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AJ__I__AJ = (function(original, newLength) {
  var b = (($n(original).u.length >>> 1) | 0);
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_J(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AC__I__AC = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_C(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AF__I__AF = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_F(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AD__I__AD = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_D(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOf__AZ__I__AZ = (function(original, newLength) {
  var b = $n(original).u.length;
  var copyLength = ((newLength < b) ? newLength : b);
  var ret = new $ac_Z(newLength);
  $systemArraycopy($n(original), 0, ret, 0, copyLength);
  return ret;
});
$c_ju_Arrays$.prototype.copyOfRange__AO__I__I__AO = (function(original, from, to) {
  if ((from > to)) {
    throw $ct_jl_IllegalArgumentException__T__(new $c_jl_IllegalArgumentException(), ((from + " > ") + to));
  }
  var len = $n(original).u.length;
  var retLength = ((to - from) | 0);
  var b = ((len - from) | 0);
  var copyLength = ((retLength < b) ? retLength : b);
  var this$3 = $n(original);
  var clazz = $objectGetClass(this$3);
  var componentType = clazz.data.getComponentType();
  var ret = $asArrayOf_O($n(componentType).data.newArray(retLength), 1);
  $systemArraycopyRefs($n(original), from, $n(ret), 0, copyLength);
  return ret;
});
var $d_ju_Arrays$ = new $TypeData().initClass($c_ju_Arrays$, "java.util.Arrays$", ({
  ju_Arrays$: 1
}));
var $n_ju_Arrays$;
function $m_ju_Arrays$() {
  if ((!$n_ju_Arrays$)) {
    $n_ju_Arrays$ = new $c_ju_Arrays$();
  }
  return $n_ju_Arrays$;
}
function $s_RTLong__remainderUnsigned__I__I__I__I__J(alo, ahi, blo, bhi) {
  var this$1 = $m_RTLong$();
  return this$1.remainderUnsignedImpl__I__I__I__I__J(alo, ahi, blo, bhi);
}
function $s_RTLong__remainder__I__I__I__I__J(alo, ahi, blo, bhi) {
  return $m_RTLong$().remainder__I__I__I__I__J(alo, ahi, blo, bhi);
}
function $s_RTLong__divideUnsigned__I__I__I__I__J(alo, ahi, blo, bhi) {
  var this$1 = $m_RTLong$();
  return this$1.divideUnsignedImpl__I__I__I__I__J(alo, ahi, blo, bhi);
}
function $s_RTLong__divide__I__I__I__I__J(alo, ahi, blo, bhi) {
  return $m_RTLong$().divide__I__I__I__I__J(alo, ahi, blo, bhi);
}
function $s_RTLong__fromDoubleBits__D__O__J(value, fpBitsDataView) {
  fpBitsDataView.setFloat64(0, value, true);
  var lo = $uI(fpBitsDataView.getInt32(0, true));
  var hi = $uI(fpBitsDataView.getInt32(4, true));
  return $bL(lo, hi);
}
function $s_RTLong__fromDouble__D__J(value) {
  return $m_RTLong$().fromDouble__D__J(value);
}
function $s_RTLong__fromUnsignedInt__I__J(value) {
  return $bL(value, 0);
}
function $s_RTLong__fromInt__I__J(value) {
  var hi = (value >> 31);
  return $bL(value, hi);
}
function $s_RTLong__clz__I__I__I(lo, hi) {
  return ((hi !== 0) ? Math.clz32(hi) : ((32 + Math.clz32(lo)) | 0));
}
function $s_RTLong__toFloat__I__I__F(lo, hi) {
  var compressedLo = (((((-2097152) & (hi ^ (hi >> 10))) === 0) || ((65535 & lo) === 0)) ? lo : (32768 | ((-32768) & lo)));
  return Math.fround(((4.294967296E9 * hi) + (compressedLo >>> 0.0)));
}
function $s_RTLong__toDouble__I__I__D(lo, hi) {
  return ((4.294967296E9 * hi) + (lo >>> 0.0));
}
function $s_RTLong__toInt__I__I__I(lo, hi) {
  return lo;
}
function $s_RTLong__toString__I__I__T(lo, hi) {
  return $m_RTLong$().toString__I__I__T(lo, hi);
}
function $s_RTLong__bitsToDouble__I__I__O__D(lo, hi, fpBitsDataView) {
  fpBitsDataView.setInt32(0, lo, true);
  fpBitsDataView.setInt32(4, hi, true);
  return $uD(fpBitsDataView.getFloat64(0, true));
}
function $s_RTLong__mul__I__I__I__I__J(alo, ahi, blo, bhi) {
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var a0b0 = Math.imul(a0, b0);
  var a1b0 = Math.imul(a1, b0);
  var a0b1 = Math.imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi = ((((((((Math.imul(alo, bhi) + Math.imul(ahi, blo)) | 0) + Math.imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  return $bL(lo, hi);
}
function $s_RTLong__sub__I__I__I__I__J(alo, ahi, blo, bhi) {
  var lo = ((alo - blo) | 0);
  var hi = ((((ahi - bhi) | 0) - (((lo >>> 0) > (alo >>> 0)) | 0)) | 0);
  return $bL(lo, hi);
}
function $s_RTLong__add__I__I__I__I__J(alo, ahi, blo, bhi) {
  var lo = ((alo + blo) | 0);
  var hi = ((((ahi + bhi) | 0) + (((lo >>> 0) < (alo >>> 0)) | 0)) | 0);
  return $bL(lo, hi);
}
function $s_RTLong__sar__I__I__I__J(lo, hi, n) {
  var lo$1 = (((32 & n) === 0) ? (((lo >>> n) | 0) | ((hi << 1) << (~n))) : (hi >> n));
  var hi$1 = (((32 & n) === 0) ? (hi >> n) : (hi >> 31));
  return $bL(lo$1, hi$1);
}
function $s_RTLong__shr__I__I__I__J(lo, hi, n) {
  var lo$1 = (((32 & n) === 0) ? (((lo >>> n) | 0) | ((hi << 1) << (~n))) : ((hi >>> n) | 0));
  var hi$1 = (((32 & n) === 0) ? ((hi >>> n) | 0) : 0);
  return $bL(lo$1, hi$1);
}
function $s_RTLong__shl__I__I__I__J(lo, hi, n) {
  var lo$1 = (((32 & n) === 0) ? (lo << n) : 0);
  var hi$1 = (((32 & n) === 0) ? (((((lo >>> 1) | 0) >>> (~n)) | 0) | (hi << n)) : (lo << n));
  return $bL(lo$1, hi$1);
}
function $s_RTLong__xor__I__I__I__I__J(alo, ahi, blo, bhi) {
  var lo = (alo ^ blo);
  var hi = (ahi ^ bhi);
  return $bL(lo, hi);
}
function $s_RTLong__and__I__I__I__I__J(alo, ahi, blo, bhi) {
  var lo = (alo & blo);
  var hi = (ahi & bhi);
  return $bL(lo, hi);
}
function $s_RTLong__or__I__I__I__I__J(alo, ahi, blo, bhi) {
  var lo = (alo | blo);
  var hi = (ahi | bhi);
  return $bL(lo, hi);
}
function $s_RTLong__geu__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) >= (blo >>> 0)) : ((ahi >>> 0) > (bhi >>> 0)));
}
function $s_RTLong__gtu__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) > (blo >>> 0)) : ((ahi >>> 0) > (bhi >>> 0)));
}
function $s_RTLong__leu__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) <= (blo >>> 0)) : ((ahi >>> 0) < (bhi >>> 0)));
}
function $s_RTLong__ltu__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) < (blo >>> 0)) : ((ahi >>> 0) < (bhi >>> 0)));
}
function $s_RTLong__ge__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) >= (blo >>> 0)) : (ahi > bhi));
}
function $s_RTLong__gt__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) > (blo >>> 0)) : (ahi > bhi));
}
function $s_RTLong__le__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) <= (blo >>> 0)) : (ahi < bhi));
}
function $s_RTLong__lt__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo >>> 0) < (blo >>> 0)) : (ahi < bhi));
}
function $s_RTLong__notEquals__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return (((alo ^ blo) | (ahi ^ bhi)) !== 0);
}
function $s_RTLong__equals__I__I__I__I__Z(alo, ahi, blo, bhi) {
  return (((alo ^ blo) | (ahi ^ bhi)) === 0);
}
/** @constructor */
function $c_RTLong$() {
}
$c_RTLong$.prototype = new $h_O();
$c_RTLong$.prototype.constructor = $c_RTLong$;
/** @constructor */
function $h_RTLong$() {
}
$h_RTLong$.prototype = $c_RTLong$.prototype;
$c_RTLong$.prototype.toString__I__I__T = (function(lo, hi) {
  if ((hi === (lo >> 31))) {
    return ("" + lo);
  } else if ((((-2097152) & (hi ^ (hi >> 10))) === 0)) {
    var this$2 = ((4.294967296E9 * hi) + (lo >>> 0.0));
    return ("" + this$2);
  } else {
    var sign = (hi >> 31);
    var xlo = (lo ^ sign);
    var rlo = ((xlo - sign) | 0);
    var rhi = (((hi ^ sign) + (((rlo >>> 0) < (xlo >>> 0)) | 0)) | 0);
    var aHat = ((4.294967296E9 * (rhi >>> 0.0)) + (rlo >>> 0.0));
    var qHat = $uD(Math.floor((1.0000000000000265E-9 * aHat)));
    var x = qHat;
    var rHat = ((rlo - Math.imul(1000000000, (x | 0.0))) | 0);
    if ((rHat < 0)) {
      qHat = (qHat - 1.0);
      rHat = ((1000000000 + rHat) | 0);
    }
    var this$7 = rHat;
    var remStr = ("" + this$7);
    var this$9 = qHat;
    var start = remStr.length;
    var s = ((("" + this$9) + $as_T("000000000".substring(start))) + remStr);
    return ((hi < 0) ? ("-" + s) : s);
  }
});
$c_RTLong$.prototype.fromDouble__D__J = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    return $bL(0, (-2147483648));
  } else if ((value >= 9.223372036854776E18)) {
    return $bL((-1), 2147483647);
  } else {
    var rawLo = (value | 0.0);
    var x = (2.3283064365386963E-10 * value);
    var rawHi = (x | 0.0);
    var hi = (((value < 0.0) && (rawLo !== 0)) ? ((rawHi - 1) | 0) : rawHi);
    return $bL(rawLo, hi);
  }
});
$c_RTLong$.prototype.divide__I__I__I__I__J = (function(alo, ahi, blo, bhi) {
  var sign = (ahi >> 31);
  var xlo = (alo ^ sign);
  var rlo = ((xlo - sign) | 0);
  var rhi = (((ahi ^ sign) + (((rlo >>> 0) < (xlo >>> 0)) | 0)) | 0);
  var sign$1 = (bhi >> 31);
  var xlo$1 = (blo ^ sign$1);
  var rlo$1 = ((xlo$1 - sign$1) | 0);
  var rhi$1 = (((bhi ^ sign$1) + (((rlo$1 >>> 0) < (xlo$1 >>> 0)) | 0)) | 0);
  var b = ((-2097152) & rlo$1);
  if (((rhi$1 | b) === 0)) {
    var quotHi = (((rhi >>> 0) / ($checkIntDivisor(rlo$1) >>> 0)) | 0);
    var k = ((rhi - Math.imul(rlo$1, quotHi)) | 0);
    var x = (((4.294967296E9 * k) + (rlo >>> 0.0)) / rlo$1);
    var quotLo = (x | 0.0);
    var absR_$_lo = quotLo;
    var absR_$_hi = quotHi;
  } else {
    var aHat = ((4.294967296E9 * (rhi >>> 0.0)) + (rlo >>> 0.0));
    var bHat = ((4.294967296E9 * (rhi$1 >>> 0.0)) + (rlo$1 >>> 0.0));
    var x$1 = ((aHat / bHat) + 0.00390625);
    var lo = (x$1 | 0.0);
    var x$2 = (2.3283064365386963E-10 * x$1);
    var hi = (x$2 | 0.0);
    var a0 = (65535 & rlo$1);
    var a1 = ((rlo$1 >>> 16) | 0);
    var b0 = (65535 & lo);
    var b1 = ((lo >>> 16) | 0);
    var a0b0 = Math.imul(a0, b0);
    var a1b0 = Math.imul(a1, b0);
    var a0b1 = Math.imul(a0, b1);
    var lo$1 = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
    var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
    var hi$1 = ((((((((Math.imul(rlo$1, hi) + Math.imul(rhi$1, lo)) | 0) + Math.imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
    var lo$2 = ((rlo - lo$1) | 0);
    var hi$2 = ((((rhi - hi$1) | 0) - (((lo$2 >>> 0) > (rlo >>> 0)) | 0)) | 0);
    if ((hi$2 < 0)) {
      var lo$3 = ((lo - 1) | 0);
      var hi$3 = ((((hi - 1) | 0) + ((lo$3 !== (-1)) | 0)) | 0);
      var absR_$_lo = lo$3;
      var absR_$_hi = hi$3;
    } else {
      var absR_$_lo = lo;
      var absR_$_hi = hi;
    }
  }
  if (((ahi ^ bhi) >= 0)) {
    return $bL(absR_$_lo, absR_$_hi);
  } else {
    var lo$4 = ((-absR_$_lo) | 0);
    var hi$4 = ((((-absR_$_hi) | 0) - ((lo$4 !== 0) | 0)) | 0);
    return $bL(lo$4, hi$4);
  }
});
$c_RTLong$.prototype.divideUnsignedImpl__I__I__I__I__J = (function(alo, ahi, blo, bhi) {
  var b = ((-2097152) & blo);
  if (((bhi | b) === 0)) {
    var quotHi = (((ahi >>> 0) / ($checkIntDivisor(blo) >>> 0)) | 0);
    var k = ((ahi - Math.imul(blo, quotHi)) | 0);
    var x = (((4.294967296E9 * k) + (alo >>> 0.0)) / blo);
    var quotLo = (x | 0.0);
    return $bL(quotLo, quotHi);
  } else if ((bhi >= 0)) {
    var aHat = ((4.294967296E9 * (ahi >>> 0.0)) + (alo >>> 0.0));
    var bHat = ((4.294967296E9 * (bhi >>> 0.0)) + (blo >>> 0.0));
    var x$1 = ((aHat / bHat) + 0.00390625);
    var lo = (x$1 | 0.0);
    var x$2 = (2.3283064365386963E-10 * x$1);
    var hi = (x$2 | 0.0);
    var a0 = (65535 & blo);
    var a1 = ((blo >>> 16) | 0);
    var b0 = (65535 & lo);
    var b1 = ((lo >>> 16) | 0);
    var a0b0 = Math.imul(a0, b0);
    var a1b0 = Math.imul(a1, b0);
    var a0b1 = Math.imul(a0, b1);
    var lo$1 = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
    var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
    var hi$1 = ((((((((Math.imul(blo, hi) + Math.imul(bhi, lo)) | 0) + Math.imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
    var lo$2 = ((alo - lo$1) | 0);
    var hi$2 = ((((ahi - hi$1) | 0) - (((lo$2 >>> 0) > (alo >>> 0)) | 0)) | 0);
    if ((hi$2 < 0)) {
      var lo$3 = ((lo - 1) | 0);
      var hi$3 = ((((hi - 1) | 0) + ((lo$3 !== (-1)) | 0)) | 0);
      return $bL(lo$3, hi$3);
    } else {
      return $bL(lo, hi);
    }
  } else if (((ahi === bhi) ? ((alo >>> 0) < (blo >>> 0)) : ((ahi >>> 0) < (bhi >>> 0)))) {
    return $bL(0, 0);
  } else {
    return $bL(1, 0);
  }
});
$c_RTLong$.prototype.remainder__I__I__I__I__J = (function(alo, ahi, blo, bhi) {
  var sign = (ahi >> 31);
  var xlo = (alo ^ sign);
  var rlo = ((xlo - sign) | 0);
  var rhi = (((ahi ^ sign) + (((rlo >>> 0) < (xlo >>> 0)) | 0)) | 0);
  var sign$1 = (bhi >> 31);
  var xlo$1 = (blo ^ sign$1);
  var rlo$1 = ((xlo$1 - sign$1) | 0);
  var rhi$1 = (((bhi ^ sign$1) + (((rlo$1 >>> 0) < (xlo$1 >>> 0)) | 0)) | 0);
  var b = ((-2097152) & rlo$1);
  if (((rhi$1 | b) === 0)) {
    var k$2 = (((rhi >>> 0) % ($checkIntDivisor(rlo$1) >>> 0)) | 0);
    var x = (((4.294967296E9 * k$2) + (rlo >>> 0.0)) / rlo$1);
    var quotLo$2 = (x | 0.0);
    var remLo = ((rlo - Math.imul(rlo$1, quotLo$2)) | 0);
    var absR_$_lo = remLo;
    var absR_$_hi = 0;
  } else {
    var aHat = ((4.294967296E9 * (rhi >>> 0.0)) + (rlo >>> 0.0));
    var bHat = ((4.294967296E9 * (rhi$1 >>> 0.0)) + (rlo$1 >>> 0.0));
    var x$1 = ((aHat / bHat) + 0.00390625);
    var lo = (x$1 | 0.0);
    var x$2 = (2.3283064365386963E-10 * x$1);
    var hi = (x$2 | 0.0);
    var a0 = (65535 & rlo$1);
    var a1 = ((rlo$1 >>> 16) | 0);
    var b0 = (65535 & lo);
    var b1 = ((lo >>> 16) | 0);
    var a0b0 = Math.imul(a0, b0);
    var a1b0 = Math.imul(a1, b0);
    var a0b1 = Math.imul(a0, b1);
    var lo$1 = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
    var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
    var hi$1 = ((((((((Math.imul(rlo$1, hi) + Math.imul(rhi$1, lo)) | 0) + Math.imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
    var lo$2 = ((rlo - lo$1) | 0);
    var hi$2 = ((((rhi - hi$1) | 0) - (((lo$2 >>> 0) > (rlo >>> 0)) | 0)) | 0);
    if ((hi$2 < 0)) {
      var lo$3 = ((lo$2 + rlo$1) | 0);
      var hi$3 = ((((hi$2 + rhi$1) | 0) + (((lo$3 >>> 0) < (lo$2 >>> 0)) | 0)) | 0);
      var absR_$_lo = lo$3;
      var absR_$_hi = hi$3;
    } else {
      var absR_$_lo = lo$2;
      var absR_$_hi = hi$2;
    }
  }
  if ((ahi < 0)) {
    var lo$4 = ((-absR_$_lo) | 0);
    var hi$4 = ((((-absR_$_hi) | 0) - ((lo$4 !== 0) | 0)) | 0);
    return $bL(lo$4, hi$4);
  } else {
    return $bL(absR_$_lo, absR_$_hi);
  }
});
$c_RTLong$.prototype.remainderUnsignedImpl__I__I__I__I__J = (function(alo, ahi, blo, bhi) {
  var b = ((-2097152) & blo);
  if (((bhi | b) === 0)) {
    var k$2 = (((ahi >>> 0) % ($checkIntDivisor(blo) >>> 0)) | 0);
    var x = (((4.294967296E9 * k$2) + (alo >>> 0.0)) / blo);
    var quotLo$2 = (x | 0.0);
    var remLo = ((alo - Math.imul(blo, quotLo$2)) | 0);
    return $bL(remLo, 0);
  } else if ((bhi >= 0)) {
    var aHat = ((4.294967296E9 * (ahi >>> 0.0)) + (alo >>> 0.0));
    var bHat = ((4.294967296E9 * (bhi >>> 0.0)) + (blo >>> 0.0));
    var x$1 = ((aHat / bHat) + 0.00390625);
    var lo = (x$1 | 0.0);
    var x$2 = (2.3283064365386963E-10 * x$1);
    var hi = (x$2 | 0.0);
    var a0 = (65535 & blo);
    var a1 = ((blo >>> 16) | 0);
    var b0 = (65535 & lo);
    var b1 = ((lo >>> 16) | 0);
    var a0b0 = Math.imul(a0, b0);
    var a1b0 = Math.imul(a1, b0);
    var a0b1 = Math.imul(a0, b1);
    var lo$1 = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
    var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
    var hi$1 = ((((((((Math.imul(blo, hi) + Math.imul(bhi, lo)) | 0) + Math.imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
    var lo$2 = ((alo - lo$1) | 0);
    var hi$2 = ((((ahi - hi$1) | 0) - (((lo$2 >>> 0) > (alo >>> 0)) | 0)) | 0);
    if ((hi$2 < 0)) {
      var lo$3 = ((lo$2 + blo) | 0);
      var hi$3 = ((((hi$2 + bhi) | 0) + (((lo$3 >>> 0) < (lo$2 >>> 0)) | 0)) | 0);
      return $bL(lo$3, hi$3);
    } else {
      return $bL(lo$2, hi$2);
    }
  } else if (((ahi === bhi) ? ((alo >>> 0) < (blo >>> 0)) : ((ahi >>> 0) < (bhi >>> 0)))) {
    return $bL(alo, ahi);
  } else {
    var lo$4 = ((alo - blo) | 0);
    var hi$4 = ((((ahi - bhi) | 0) - (((lo$4 >>> 0) > (alo >>> 0)) | 0)) | 0);
    return $bL(lo$4, hi$4);
  }
});
var $d_RTLong$ = new $TypeData().initClass($c_RTLong$, "org.scalajs.linker.runtime.RuntimeLong$", ({
  RTLong$: 1
}));
var $n_RTLong$;
function $m_RTLong$() {
  if ((!$n_RTLong$)) {
    $n_RTLong$ = new $c_RTLong$();
  }
  return $n_RTLong$;
}
function $p_s_Array$__slowcopy__O__I__O__I__I__V($thiz, src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array_update__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array_apply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0);
  }
}
function $p_s_Array$__newUnitArray__I__Ajl_Void($thiz, len) {
  var result = new ($d_jl_Void.getArrayOf().constr)(len);
  $m_ju_Arrays$().fill__AO__O__V(result, (void 0));
  return result;
}
/** @constructor */
function $c_s_Array$() {
}
$c_s_Array$.prototype = new $h_O();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var this$1 = $n(src);
  var srcClass = $objectGetClass(this$1);
  var this$2 = $n(srcClass);
  if (this$2.data.isArrayClass) {
    var this$3 = $n(dest);
    var this$4 = $n($objectGetClass(this$3));
    var $x_1 = this$4.data.isAssignableFrom($n(srcClass).data);
  } else {
    var $x_1 = false;
  }
  if ($x_1) {
    $systemArraycopyFull($n(src), srcPos, $n(dest), destPos, length);
  } else {
    $p_s_Array$__slowcopy__O__I__O__I__I__V(this, src, srcPos, dest, destPos, length);
  }
});
$c_s_Array$.prototype.copyOf__O__I__O = (function(original, newLength) {
  if ($isArrayOf_jl_Void(original, 1)) {
    $asArrayOf_jl_Void(original, 1);
    return $p_s_Array$__newUnitArray__I__Ajl_Void(this, newLength);
  }
  if ((original instanceof $ac_O)) {
    var x$2 = $asArrayOf_O(original, 1);
    return $m_ju_Arrays$().copyOf__AO__I__AO(x$2, newLength);
  }
  if ((original instanceof $ac_I)) {
    var x$3 = $asArrayOf_I(original, 1);
    return $m_ju_Arrays$().copyOf__AI__I__AI(x$3, newLength);
  }
  if ((original instanceof $ac_D)) {
    var x$4 = $asArrayOf_D(original, 1);
    return $m_ju_Arrays$().copyOf__AD__I__AD(x$4, newLength);
  }
  if ((original instanceof $ac_J)) {
    var x$5 = $asArrayOf_J(original, 1);
    return $m_ju_Arrays$().copyOf__AJ__I__AJ(x$5, newLength);
  }
  if ((original instanceof $ac_F)) {
    var x$6 = $asArrayOf_F(original, 1);
    return $m_ju_Arrays$().copyOf__AF__I__AF(x$6, newLength);
  }
  if ((original instanceof $ac_C)) {
    var x$7 = $asArrayOf_C(original, 1);
    return $m_ju_Arrays$().copyOf__AC__I__AC(x$7, newLength);
  }
  if ((original instanceof $ac_B)) {
    var x$8 = $asArrayOf_B(original, 1);
    return $m_ju_Arrays$().copyOf__AB__I__AB(x$8, newLength);
  }
  if ((original instanceof $ac_S)) {
    var x$9 = $asArrayOf_S(original, 1);
    return $m_ju_Arrays$().copyOf__AS__I__AS(x$9, newLength);
  }
  if ((original instanceof $ac_Z)) {
    var x$10 = $asArrayOf_Z(original, 1);
    return $m_ju_Arrays$().copyOf__AZ__I__AZ(x$10, newLength);
  }
  throw new $c_s_MatchError(original);
});
var $d_s_Array$ = new $TypeData().initClass($c_s_Array$, "scala.Array$", ({
  s_Array$: 1
}));
var $n_s_Array$;
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$();
  }
  return $n_s_Array$;
}
/** @constructor */
function $c_s_Array$EmptyArrays$() {
  this.s_Array$EmptyArrays$__f_emptyIntArray = null;
  this.s_Array$EmptyArrays$__f_emptyObjectArray = null;
  $n_s_Array$EmptyArrays$ = this;
  this.s_Array$EmptyArrays$__f_emptyIntArray = new $ac_I(0);
  this.s_Array$EmptyArrays$__f_emptyObjectArray = new $ac_O(0);
}
$c_s_Array$EmptyArrays$.prototype = new $h_O();
$c_s_Array$EmptyArrays$.prototype.constructor = $c_s_Array$EmptyArrays$;
/** @constructor */
function $h_s_Array$EmptyArrays$() {
}
$h_s_Array$EmptyArrays$.prototype = $c_s_Array$EmptyArrays$.prototype;
var $d_s_Array$EmptyArrays$ = new $TypeData().initClass($c_s_Array$EmptyArrays$, "scala.Array$EmptyArrays$", ({
  s_Array$EmptyArrays$: 1
}));
var $n_s_Array$EmptyArrays$;
function $m_s_Array$EmptyArrays$() {
  if ((!$n_s_Array$EmptyArrays$)) {
    $n_s_Array$EmptyArrays$ = new $c_s_Array$EmptyArrays$();
  }
  return $n_s_Array$EmptyArrays$;
}
/** @constructor */
function $c_s_LowPriorityImplicits2() {
}
$c_s_LowPriorityImplicits2.prototype = new $h_O();
$c_s_LowPriorityImplicits2.prototype.constructor = $c_s_LowPriorityImplicits2;
/** @constructor */
function $h_s_LowPriorityImplicits2() {
}
$h_s_LowPriorityImplicits2.prototype = $c_s_LowPriorityImplicits2.prototype;
/** @constructor */
function $c_sc_Hashing$() {
}
$c_sc_Hashing$.prototype = new $h_O();
$c_sc_Hashing$.prototype.constructor = $c_sc_Hashing$;
/** @constructor */
function $h_sc_Hashing$() {
}
$h_sc_Hashing$.prototype = $c_sc_Hashing$.prototype;
$c_sc_Hashing$.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0));
});
var $d_sc_Hashing$ = new $TypeData().initClass($c_sc_Hashing$, "scala.collection.Hashing$", ({
  sc_Hashing$: 1
}));
var $n_sc_Hashing$;
function $m_sc_Hashing$() {
  if ((!$n_sc_Hashing$)) {
    $n_sc_Hashing$ = new $c_sc_Hashing$();
  }
  return $n_sc_Hashing$;
}
function $is_sc_IterableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IterableOnce)));
}
function $as_sc_IterableOnce(obj) {
  return (($is_sc_IterableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IterableOnce"));
}
function $isArrayOf_sc_IterableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IterableOnce)));
}
function $asArrayOf_sc_IterableOnce(obj, depth) {
  return (($isArrayOf_sc_IterableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IterableOnce;", depth));
}
function $f_sc_IterableOnceOps__foreach__F1__V($thiz, f) {
  var it = $n($as_sc_IterableOnce($thiz)).iterator__sc_Iterator();
  while ($n(it).hasNext__Z()) {
    $n(f).apply__O__O($n(it).next__O());
  }
}
function $f_sc_IterableOnceOps__forall__F1__Z($thiz, p) {
  var res = true;
  var it = $n($as_sc_IterableOnce($thiz)).iterator__sc_Iterator();
  while ((res && $n(it).hasNext__Z())) {
    res = $uZ($n(p).apply__O__O($n(it).next__O()));
  }
  return res;
}
function $f_sc_IterableOnceOps__copyToArray__O__I__I__I($thiz, dest, start, n) {
  var it = $n($as_sc_IterableOnce($thiz)).iterator__sc_Iterator();
  var i = start;
  matchResult18: {
    var srclen;
    var x31 = $n($as_sc_IterableOnce($thiz)).knownSize__I();
    if ((x31 === (-1))) {
      var srclen = $m_jl_reflect_Array$().getLength__O__I(dest);
      break matchResult18;
    }
    var srclen = x31;
  }
  var destLen = $m_jl_reflect_Array$().getLength__O__I(dest);
  var limit = ((n < srclen) ? n : srclen);
  var capacity = ((start < 0) ? destLen : ((destLen - start) | 0));
  var total = ((capacity < limit) ? capacity : limit);
  var end = ((start + ((total < 0) ? 0 : total)) | 0);
  while (((i < end) && $n(it).hasNext__Z())) {
    $m_sr_ScalaRunTime$().array_update__O__I__O__V(dest, i, $n(it).next__O());
    i = ((1 + i) | 0);
  }
  return ((i - start) | 0);
}
function $f_sc_IterableOnceOps__mkString__T__T__T__T($thiz, start, sep, end) {
  if (($n($as_sc_IterableOnce($thiz)).knownSize__I() === 0)) {
    return (("" + start) + end);
  } else {
    var this$1 = $n($thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder($ct_scm_StringBuilder__(new $c_scm_StringBuilder()), start, sep, end));
    return $n(this$1.scm_StringBuilder__f_underlying).jl_StringBuilder__f_java$lang$StringBuilder$$content;
  }
}
function $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var jsb = $n(b).scm_StringBuilder__f_underlying;
  var this$1 = $n(start);
  if ((this$1.length !== 0)) {
    var this$2 = $n(jsb);
    this$2.jl_StringBuilder__f_java$lang$StringBuilder$$content = (("" + this$2.jl_StringBuilder__f_java$lang$StringBuilder$$content) + start);
  }
  var it = $n($as_sc_IterableOnce($thiz)).iterator__sc_Iterator();
  if ($n(it).hasNext__Z()) {
    var this$3 = $n(jsb);
    var obj = $n(it).next__O();
    this$3.jl_StringBuilder__f_java$lang$StringBuilder$$content = (("" + this$3.jl_StringBuilder__f_java$lang$StringBuilder$$content) + obj);
    while ($n(it).hasNext__Z()) {
      var this$4 = $n(sep);
      if ((this$4.length !== 0)) {
        var this$5 = $n(jsb);
        this$5.jl_StringBuilder__f_java$lang$StringBuilder$$content = (("" + this$5.jl_StringBuilder__f_java$lang$StringBuilder$$content) + sep);
      }
      var this$6 = $n(jsb);
      var obj$1 = $n(it).next__O();
      this$6.jl_StringBuilder__f_java$lang$StringBuilder$$content = (("" + this$6.jl_StringBuilder__f_java$lang$StringBuilder$$content) + obj$1);
    }
  }
  var this$7 = $n(end);
  if ((this$7.length !== 0)) {
    var this$8 = $n(jsb);
    this$8.jl_StringBuilder__f_java$lang$StringBuilder$$content = (("" + this$8.jl_StringBuilder__f_java$lang$StringBuilder$$content) + end);
  }
  return b;
}
/** @constructor */
function $c_sc_Iterator$ConcatIteratorCell(head, tail) {
  this.sc_Iterator$ConcatIteratorCell__f_head = null;
  this.sc_Iterator$ConcatIteratorCell__f_tail = null;
  this.sc_Iterator$ConcatIteratorCell__f_head = head;
  this.sc_Iterator$ConcatIteratorCell__f_tail = tail;
}
$c_sc_Iterator$ConcatIteratorCell.prototype = new $h_O();
$c_sc_Iterator$ConcatIteratorCell.prototype.constructor = $c_sc_Iterator$ConcatIteratorCell;
/** @constructor */
function $h_sc_Iterator$ConcatIteratorCell() {
}
$h_sc_Iterator$ConcatIteratorCell.prototype = $c_sc_Iterator$ConcatIteratorCell.prototype;
$c_sc_Iterator$ConcatIteratorCell.prototype.headIterator__sc_Iterator = (function() {
  return $n($as_sc_IterableOnce($n(this.sc_Iterator$ConcatIteratorCell__f_head).apply__O())).iterator__sc_Iterator();
});
var $d_sc_Iterator$ConcatIteratorCell = new $TypeData().initClass($c_sc_Iterator$ConcatIteratorCell, "scala.collection.Iterator$ConcatIteratorCell", ({
  sc_Iterator$ConcatIteratorCell: 1
}));
/** @constructor */
function $c_sc_StringOps$() {
  this.sc_StringOps$__f_fallback = null;
  $n_sc_StringOps$ = this;
  this.sc_StringOps$__f_fallback = new $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(((_$1$2) => this.sc_StringOps$__f_fallback));
}
$c_sc_StringOps$.prototype = new $h_O();
$c_sc_StringOps$.prototype.constructor = $c_sc_StringOps$;
/** @constructor */
function $h_sc_StringOps$() {
}
$h_sc_StringOps$.prototype = $c_sc_StringOps$.prototype;
var $d_sc_StringOps$ = new $TypeData().initClass($c_sc_StringOps$, "scala.collection.StringOps$", ({
  sc_StringOps$: 1
}));
var $n_sc_StringOps$;
function $m_sc_StringOps$() {
  if ((!$n_sc_StringOps$)) {
    $n_sc_StringOps$ = new $c_sc_StringOps$();
  }
  return $n_sc_StringOps$;
}
/** @constructor */
function $c_scg_CommonErrors$() {
}
$c_scg_CommonErrors$.prototype = new $h_O();
$c_scg_CommonErrors$.prototype.constructor = $c_scg_CommonErrors$;
/** @constructor */
function $h_scg_CommonErrors$() {
}
$h_scg_CommonErrors$.prototype = $c_scg_CommonErrors$.prototype;
$c_scg_CommonErrors$.prototype.indexOutOfBounds__I__I__jl_IndexOutOfBoundsException = (function(index, max) {
  return $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), (((index + " is out of bounds (min 0, max ") + max) + ")"));
});
var $d_scg_CommonErrors$ = new $TypeData().initClass($c_scg_CommonErrors$, "scala.collection.generic.CommonErrors$", ({
  scg_CommonErrors$: 1
}));
var $n_scg_CommonErrors$;
function $m_scg_CommonErrors$() {
  if ((!$n_scg_CommonErrors$)) {
    $n_scg_CommonErrors$ = new $c_scg_CommonErrors$();
  }
  return $n_scg_CommonErrors$;
}
/** @constructor */
function $c_sci_IndexedSeqDefaults$() {
  this.sci_IndexedSeqDefaults$__f_defaultApplyPreferredMaxLength = 0;
  $n_sci_IndexedSeqDefaults$ = this;
  try {
    $m_sc_StringOps$();
    var x = $m_jl_System$SystemProperties$().getProperty__T__T__T("scala.collection.immutable.IndexedSeq.defaultApplyPreferredMaxLength", "64");
    var this$4 = $m_jl_Integer$();
    var $x_1 = this$4.java$lang$Integer$$parseIntImpl__T__I__I__I(x, 10, 214748364);
  } catch (e) {
    if (false) {
      var $x_1 = 64;
    } else {
      var $x_1;
      throw e;
    }
  }
  this.sci_IndexedSeqDefaults$__f_defaultApplyPreferredMaxLength = $x_1;
}
$c_sci_IndexedSeqDefaults$.prototype = new $h_O();
$c_sci_IndexedSeqDefaults$.prototype.constructor = $c_sci_IndexedSeqDefaults$;
/** @constructor */
function $h_sci_IndexedSeqDefaults$() {
}
$h_sci_IndexedSeqDefaults$.prototype = $c_sci_IndexedSeqDefaults$.prototype;
var $d_sci_IndexedSeqDefaults$ = new $TypeData().initClass($c_sci_IndexedSeqDefaults$, "scala.collection.immutable.IndexedSeqDefaults$", ({
  sci_IndexedSeqDefaults$: 1
}));
var $n_sci_IndexedSeqDefaults$;
function $m_sci_IndexedSeqDefaults$() {
  if ((!$n_sci_IndexedSeqDefaults$)) {
    $n_sci_IndexedSeqDefaults$ = new $c_sci_IndexedSeqDefaults$();
  }
  return $n_sci_IndexedSeqDefaults$;
}
/** @constructor */
function $c_sci_MapNode$() {
  this.sci_MapNode$__f_EmptyMapNode = null;
  $n_sci_MapNode$ = this;
  $m_s_reflect_ManifestFactory$IntManifest$();
  this.sci_MapNode$__f_EmptyMapNode = new $c_sci_BitmapIndexedMapNode(0, 0, new $ac_O(0), new $ac_I(0), 0, 0);
}
$c_sci_MapNode$.prototype = new $h_O();
$c_sci_MapNode$.prototype.constructor = $c_sci_MapNode$;
/** @constructor */
function $h_sci_MapNode$() {
}
$h_sci_MapNode$.prototype = $c_sci_MapNode$.prototype;
var $d_sci_MapNode$ = new $TypeData().initClass($c_sci_MapNode$, "scala.collection.immutable.MapNode$", ({
  sci_MapNode$: 1
}));
var $n_sci_MapNode$;
function $m_sci_MapNode$() {
  if ((!$n_sci_MapNode$)) {
    $n_sci_MapNode$ = new $c_sci_MapNode$();
  }
  return $n_sci_MapNode$;
}
function $p_sci_Node__arrayIndexOutOfBounds__O__I__jl_ArrayIndexOutOfBoundsException($thiz, as, ix) {
  return $ct_jl_ArrayIndexOutOfBoundsException__T__(new $c_jl_ArrayIndexOutOfBoundsException(), ((ix + " is out of bounds (min 0, max ") + (($m_jl_reflect_Array$().getLength__O__I(as) - 1) | 0)));
}
/** @constructor */
function $c_sci_Node() {
}
$c_sci_Node.prototype = new $h_O();
$c_sci_Node.prototype.constructor = $c_sci_Node;
/** @constructor */
function $h_sci_Node() {
}
$h_sci_Node.prototype = $c_sci_Node.prototype;
$c_sci_Node.prototype.removeElement__AI__I__AI = (function(as, ix) {
  if ((ix < 0)) {
    throw $n($p_sci_Node__arrayIndexOutOfBounds__O__I__jl_ArrayIndexOutOfBoundsException(this, as, ix));
  }
  if ((ix > (($n(as).u.length - 1) | 0))) {
    throw $n($p_sci_Node__arrayIndexOutOfBounds__O__I__jl_ArrayIndexOutOfBoundsException(this, as, ix));
  }
  var result = new $ac_I((($n(as).u.length - 1) | 0));
  $systemArraycopy($n(as), 0, result, 0, ix);
  var srcPos = ((1 + ix) | 0);
  var length = (((($n(as).u.length - ix) | 0) - 1) | 0);
  $systemArraycopy($n(as), srcPos, result, ix, length);
  return result;
});
$c_sci_Node.prototype.insertElement__AI__I__I__AI = (function(as, ix, elem) {
  if ((ix < 0)) {
    throw $n($p_sci_Node__arrayIndexOutOfBounds__O__I__jl_ArrayIndexOutOfBoundsException(this, as, ix));
  }
  if ((ix > $n(as).u.length)) {
    throw $n($p_sci_Node__arrayIndexOutOfBounds__O__I__jl_ArrayIndexOutOfBoundsException(this, as, ix));
  }
  var result = new $ac_I(((1 + $n(as).u.length) | 0));
  $systemArraycopy($n(as), 0, result, 0, ix);
  result.set(ix, elem);
  var destPos = ((1 + ix) | 0);
  var length = (($n(as).u.length - ix) | 0);
  $systemArraycopy($n(as), ix, result, destPos, length);
  return result;
});
var $d_sci_Node = new $TypeData().initClass(0, "scala.collection.immutable.Node", ({
  sci_Node: 1
}));
/** @constructor */
function $c_sci_Node$() {
  this.sci_Node$__f_MaxDepth = 0;
  $n_sci_Node$ = this;
  this.sci_Node$__f_MaxDepth = $doubleToInt($uD(Math.ceil(6.4)));
}
$c_sci_Node$.prototype = new $h_O();
$c_sci_Node$.prototype.constructor = $c_sci_Node$;
/** @constructor */
function $h_sci_Node$() {
}
$h_sci_Node$.prototype = $c_sci_Node$.prototype;
$c_sci_Node$.prototype.maskFrom__I__I__I = (function(hash, shift) {
  return (31 & ((hash >>> shift) | 0));
});
$c_sci_Node$.prototype.bitposFrom__I__I = (function(mask) {
  return (1 << mask);
});
$c_sci_Node$.prototype.indexFrom__I__I__I = (function(bitmap, bitpos) {
  var i = (bitmap & ((bitpos - 1) | 0));
  return $m_jl_Integer$().bitCount__I__I(i);
});
$c_sci_Node$.prototype.indexFrom__I__I__I__I = (function(bitmap, mask, bitpos) {
  return ((bitmap === (-1)) ? mask : this.indexFrom__I__I__I(bitmap, bitpos));
});
var $d_sci_Node$ = new $TypeData().initClass($c_sci_Node$, "scala.collection.immutable.Node$", ({
  sci_Node$: 1
}));
var $n_sci_Node$;
function $m_sci_Node$() {
  if ((!$n_sci_Node$)) {
    $n_sci_Node$ = new $c_sci_Node$();
  }
  return $n_sci_Node$;
}
/** @constructor */
function $c_sci_VectorStatics$() {
  this.sci_VectorStatics$__f_empty1 = null;
  this.sci_VectorStatics$__f_empty2 = null;
  this.sci_VectorStatics$__f_empty3 = null;
  this.sci_VectorStatics$__f_empty4 = null;
  this.sci_VectorStatics$__f_empty5 = null;
  this.sci_VectorStatics$__f_empty6 = null;
  $n_sci_VectorStatics$ = this;
  this.sci_VectorStatics$__f_empty1 = new $ac_O(0);
  this.sci_VectorStatics$__f_empty2 = new ($d_O.getArrayOf().getArrayOf().constr)(0);
  this.sci_VectorStatics$__f_empty3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(0);
  this.sci_VectorStatics$__f_empty4 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(0);
  this.sci_VectorStatics$__f_empty5 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(0);
  this.sci_VectorStatics$__f_empty6 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(0);
}
$c_sci_VectorStatics$.prototype = new $h_O();
$c_sci_VectorStatics$.prototype.constructor = $c_sci_VectorStatics$;
/** @constructor */
function $h_sci_VectorStatics$() {
}
$h_sci_VectorStatics$.prototype = $c_sci_VectorStatics$.prototype;
$c_sci_VectorStatics$.prototype.copyAppend1__AO__O__AO = (function(a, elem) {
  var alen = $n(a).u.length;
  var ac = new $ac_O(((1 + alen) | 0));
  $systemArraycopyRefs($n(a), 0, ac, 0, alen);
  ac.set(alen, elem);
  return ac;
});
$c_sci_VectorStatics$.prototype.copyAppend__AO__O__AO = (function(a, elem) {
  var newLength = ((1 + $n(a).u.length) | 0);
  var ac = $m_ju_Arrays$().copyOf__AO__I__AO(a, newLength);
  $n(ac).set((($n(ac).u.length - 1) | 0), elem);
  return ac;
});
$c_sci_VectorStatics$.prototype.copyPrepend__O__AO__AO = (function(elem, a) {
  var this$1 = $n(a);
  var this$2 = $objectGetClass(this$1);
  var componentType = this$2.data.getComponentType();
  var length = ((1 + $n(a).u.length) | 0);
  var ac = $asArrayOf_O($n(componentType).data.newArray(length), 1);
  var length$1 = $n(a).u.length;
  $systemArraycopyRefs($n(a), 0, $n(ac), 1, length$1);
  $n(ac).set(0, elem);
  return ac;
});
$c_sci_VectorStatics$.prototype.foreachRec__I__AO__F1__V = (function(level, a, f) {
  var i = 0;
  var len = $n(a).u.length;
  if ((level === 0)) {
    while ((i < len)) {
      $n(f).apply__O__O($n(a).get(i));
      i = ((1 + i) | 0);
    }
  } else {
    var l = ((level - 1) | 0);
    while ((i < len)) {
      this.foreachRec__I__AO__F1__V(l, $asArrayOf_O($n(a).get(i), 1), f);
      i = ((1 + i) | 0);
    }
  }
});
var $d_sci_VectorStatics$ = new $TypeData().initClass($c_sci_VectorStatics$, "scala.collection.immutable.VectorStatics$", ({
  sci_VectorStatics$: 1
}));
var $n_sci_VectorStatics$;
function $m_sci_VectorStatics$() {
  if ((!$n_sci_VectorStatics$)) {
    $n_sci_VectorStatics$ = new $c_sci_VectorStatics$();
  }
  return $n_sci_VectorStatics$;
}
/** @constructor */
function $c_scm_ArrayBuilder$() {
}
$c_scm_ArrayBuilder$.prototype = new $h_O();
$c_scm_ArrayBuilder$.prototype.constructor = $c_scm_ArrayBuilder$;
/** @constructor */
function $h_scm_ArrayBuilder$() {
}
$h_scm_ArrayBuilder$.prototype = $c_scm_ArrayBuilder$.prototype;
$c_scm_ArrayBuilder$.prototype.scala$collection$mutable$ArrayBuilder$$$zeroOf__jl_Class__O = (function(runtimeClass) {
  return ((runtimeClass === $d_B.getClassOf()) ? 0 : ((runtimeClass === $d_S.getClassOf()) ? 0 : ((runtimeClass === $d_C.getClassOf()) ? 0 : ((runtimeClass === $d_I.getClassOf()) ? 0 : ((runtimeClass === $d_J.getClassOf()) ? $bL(0, 0) : ((runtimeClass === $d_F.getClassOf()) ? 0.0 : ((runtimeClass === $d_D.getClassOf()) ? 0.0 : ((runtimeClass === $d_Z.getClassOf()) ? false : ((runtimeClass === $d_V.getClassOf()) ? (void 0) : null)))))))));
});
$c_scm_ArrayBuilder$.prototype.scala$collection$mutable$ArrayBuilder$$$genericArrayBuilderResult__jl_Class__sjs_js_Array__O = (function(runtimeClass, a) {
  var len = $uI(a.length);
  if ((runtimeClass === $d_C.getClassOf())) {
    var result = new $ac_C(len);
    var i = 0;
    while ((i !== len)) {
      result.set(i, (65535 & $uI(a[i])));
      i = ((1 + i) | 0);
    }
    return result;
  } else {
    var result$2 = $n(runtimeClass).data.newArray(len);
    var i$2 = 0;
    while ((i$2 !== len)) {
      $m_sr_ScalaRunTime$().array_update__O__I__O__V(result$2, i$2, a[i$2]);
      i$2 = ((1 + i$2) | 0);
    }
    return result$2;
  }
});
var $d_scm_ArrayBuilder$ = new $TypeData().initClass($c_scm_ArrayBuilder$, "scala.collection.mutable.ArrayBuilder$", ({
  scm_ArrayBuilder$: 1
}));
var $n_scm_ArrayBuilder$;
function $m_scm_ArrayBuilder$() {
  if ((!$n_scm_ArrayBuilder$)) {
    $n_scm_ArrayBuilder$ = new $c_scm_ArrayBuilder$();
  }
  return $n_scm_ArrayBuilder$;
}
function $as_scm_HashMap$Node(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.HashMap$Node"));
}
function $isArrayOf_scm_HashMap$Node(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashMap$Node)));
}
function $asArrayOf_scm_HashMap$Node(obj, depth) {
  return (($isArrayOf_scm_HashMap$Node(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.HashMap$Node;", depth));
}
function $as_scm_LinkedHashMap$LinkedEntry(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.LinkedHashMap$LinkedEntry"));
}
function $isArrayOf_scm_LinkedHashMap$LinkedEntry(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_LinkedHashMap$LinkedEntry)));
}
function $asArrayOf_scm_LinkedHashMap$LinkedEntry(obj, depth) {
  return (($isArrayOf_scm_LinkedHashMap$LinkedEntry(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.LinkedHashMap$LinkedEntry;", depth));
}
/** @constructor */
function $c_scm_MutationTracker$() {
}
$c_scm_MutationTracker$.prototype = new $h_O();
$c_scm_MutationTracker$.prototype.constructor = $c_scm_MutationTracker$;
/** @constructor */
function $h_scm_MutationTracker$() {
}
$h_scm_MutationTracker$.prototype = $c_scm_MutationTracker$.prototype;
$c_scm_MutationTracker$.prototype.checkMutations__I__I__T__V = (function(expectedCount, actualCount, message) {
  if ((actualCount !== expectedCount)) {
    throw new $c_ju_ConcurrentModificationException(message);
  }
});
var $d_scm_MutationTracker$ = new $TypeData().initClass($c_scm_MutationTracker$, "scala.collection.mutable.MutationTracker$", ({
  scm_MutationTracker$: 1
}));
var $n_scm_MutationTracker$;
function $m_scm_MutationTracker$() {
  if ((!$n_scm_MutationTracker$)) {
    $n_scm_MutationTracker$ = new $c_scm_MutationTracker$();
  }
  return $n_scm_MutationTracker$;
}
/** @constructor */
function $c_sr_BoxesRunTime$() {
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true;
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y);
  } else if ((x instanceof $Char)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y);
  } else {
    return ((x === null) ? (y === null) : $dp_equals__O__Z($n(x), y));
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2);
  } else if ((y instanceof $Char)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      var this$1 = $n(x3).c;
      return (x2$1 === this$1);
    } else if ((xn instanceof $Long)) {
      var $x_1 = $uJ(xn);
      var x3$1_$_lo = $x_1.l;
      var x3$1_$_hi = $x_1.h;
      var this$2 = $n(x3).c;
      var value = this$2;
      var hi = (value >> 31);
      return (((x3$1_$_lo ^ value) | (x3$1_$_hi ^ hi)) === 0);
    } else {
      return ((xn === null) ? (x3 === null) : $dp_equals__O__Z($n(xn), x3));
    }
  } else {
    return ((xn === null) ? (y === null) : $dp_equals__O__Z($n(xn), y));
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2);
    } else if ((yn instanceof $Long)) {
      var $x_1 = $uJ(yn);
      var x3_$_lo = $x_1.l;
      var x3_$_hi = $x_1.h;
      return (x2 === ((4.294967296E9 * x3_$_hi) + (x3_$_lo >>> 0.0)));
    } else if (false) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return $n(x4).equals__O__Z(x2);
    } else {
      return false;
    }
  } else if ((xn instanceof $Long)) {
    var $x_2 = $uJ(xn);
    var x3$2_$_lo = $x_2.l;
    var x3$2_$_hi = $x_2.h;
    if ((yn instanceof $Long)) {
      var $x_3 = $uJ(yn);
      var x2$3_$_lo = $x_3.l;
      var x2$3_$_hi = $x_3.h;
      return (((x3$2_$_lo ^ x2$3_$_lo) | (x3$2_$_hi ^ x2$3_$_hi)) === 0);
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return (((4.294967296E9 * x3$2_$_hi) + (x3$2_$_lo >>> 0.0)) === x3$3);
    } else if (false) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return $n(x4$2).equals__O__Z($bL(x3$2_$_lo, x3$2_$_hi));
    } else {
      return false;
    }
  } else {
    return ((xn === null) ? (yn === null) : $dp_equals__O__Z($n(xn), yn));
  }
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ((y instanceof $Char)) {
    var x2 = $as_jl_Character(y);
    var this$1 = $n(xc).c;
    var this$2 = $n(x2).c;
    return (this$1 === this$2);
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      var this$3 = $n(xc).c;
      return (x2$1 === this$3);
    } else if ((x3 instanceof $Long)) {
      var $x_1 = $uJ(x3);
      var x3$1_$_lo = $x_1.l;
      var x3$1_$_hi = $x_1.h;
      var this$4 = $n(xc).c;
      var value = this$4;
      var hi = (value >> 31);
      return (((x3$1_$_lo ^ value) | (x3$1_$_hi ^ hi)) === 0);
    } else {
      return ((x3 === null) ? (xc === null) : $dp_equals__O__Z($n(x3), xc));
    }
  } else {
    return ((xc === null) && (y === null));
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass($c_sr_BoxesRunTime$, "scala.runtime.BoxesRunTime$", ({
  sr_BoxesRunTime$: 1
}));
var $n_sr_BoxesRunTime$;
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$();
  }
  return $n_sr_BoxesRunTime$;
}
/** @constructor */
function $c_sr_Scala3RunTime$() {
}
$c_sr_Scala3RunTime$.prototype = new $h_O();
$c_sr_Scala3RunTime$.prototype.constructor = $c_sr_Scala3RunTime$;
/** @constructor */
function $h_sr_Scala3RunTime$() {
}
$h_sr_Scala3RunTime$.prototype = $c_sr_Scala3RunTime$.prototype;
$c_sr_Scala3RunTime$.prototype.nnFail__E = (function() {
  throw $ct_jl_NullPointerException__T__(new $c_jl_NullPointerException(), "tried to cast away nullability, but value is null");
});
var $d_sr_Scala3RunTime$ = new $TypeData().initClass($c_sr_Scala3RunTime$, "scala.runtime.Scala3RunTime$", ({
  sr_Scala3RunTime$: 1
}));
var $n_sr_Scala3RunTime$;
function $m_sr_Scala3RunTime$() {
  if ((!$n_sr_Scala3RunTime$)) {
    $n_sr_Scala3RunTime$ = new $c_sr_Scala3RunTime$();
  }
  return $n_sr_Scala3RunTime$;
}
/** @constructor */
function $c_sr_ScalaRunTime$() {
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.array_apply__O__I__O = (function(xs, idx) {
  if ((xs instanceof $ac_O)) {
    var x = $asArrayOf_O(xs, 1);
    return $n(x).get(idx);
  }
  if ((xs instanceof $ac_I)) {
    var x$2 = $asArrayOf_I(xs, 1);
    return $n(x$2).get(idx);
  }
  if ((xs instanceof $ac_D)) {
    var x$3 = $asArrayOf_D(xs, 1);
    return $n(x$3).get(idx);
  }
  if ((xs instanceof $ac_J)) {
    var x$4 = $asArrayOf_J(xs, 1);
    var $x_1 = $n(x$4).u;
    var $x_2 = $aJCheckGet($x_1, idx);
    return $bL($x_1[$x_2], $x_1[(($x_2 + 1) | 0)]);
  }
  if ((xs instanceof $ac_F)) {
    var x$5 = $asArrayOf_F(xs, 1);
    return $n(x$5).get(idx);
  }
  if ((xs instanceof $ac_C)) {
    var x$6 = $asArrayOf_C(xs, 1);
    return $bC($n(x$6).get(idx));
  }
  if ((xs instanceof $ac_B)) {
    var x$7 = $asArrayOf_B(xs, 1);
    return $n(x$7).get(idx);
  }
  if ((xs instanceof $ac_S)) {
    var x$8 = $asArrayOf_S(xs, 1);
    return $n(x$8).get(idx);
  }
  if ((xs instanceof $ac_Z)) {
    var x$9 = $asArrayOf_Z(xs, 1);
    return $n(x$9).get(idx);
  }
  if ((xs === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  throw new $c_s_MatchError(xs);
});
$c_sr_ScalaRunTime$.prototype.array_update__O__I__O__V = (function(xs, idx, value) {
  if ((xs instanceof $ac_O)) {
    var x = $asArrayOf_O(xs, 1);
    $n(x).set(idx, value);
    return (void 0);
  }
  if ((xs instanceof $ac_I)) {
    var x$2 = $asArrayOf_I(xs, 1);
    $n(x$2).set(idx, $uI(value));
    return (void 0);
  }
  if ((xs instanceof $ac_D)) {
    var x$3 = $asArrayOf_D(xs, 1);
    $n(x$3).set(idx, $uD(value));
    return (void 0);
  }
  if ((xs instanceof $ac_J)) {
    var x$4 = $asArrayOf_J(xs, 1);
    var $x_2 = $n(x$4);
    var $x_1 = $uJ(value);
    $x_2.set(idx, $x_1.l, $x_1.h);
    return (void 0);
  }
  if ((xs instanceof $ac_F)) {
    var x$5 = $asArrayOf_F(xs, 1);
    $n(x$5).set(idx, $uF(value));
    return (void 0);
  }
  if ((xs instanceof $ac_C)) {
    var x$6 = $asArrayOf_C(xs, 1);
    $n(x$6).set(idx, $uC(value));
    return (void 0);
  }
  if ((xs instanceof $ac_B)) {
    var x$7 = $asArrayOf_B(xs, 1);
    $n(x$7).set(idx, $uB(value));
    return (void 0);
  }
  if ((xs instanceof $ac_S)) {
    var x$8 = $asArrayOf_S(xs, 1);
    $n(x$8).set(idx, $uS(value));
    return (void 0);
  }
  if ((xs instanceof $ac_Z)) {
    var x$9 = $asArrayOf_Z(xs, 1);
    $n(x$9).set(idx, $uZ(value));
    return (void 0);
  }
  if ((xs === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  throw new $c_s_MatchError(xs);
});
$c_sr_ScalaRunTime$.prototype._toString__s_Product__T = (function(x) {
  var this$1 = $n($n(x).productIterator__sc_Iterator());
  var start = ($n(x).productPrefix__T() + "(");
  return $f_sc_IterableOnceOps__mkString__T__T__T__T(this$1, start, ",", ")");
});
$c_sr_ScalaRunTime$.prototype.wrapDoubleArray__AD__sci_ArraySeq = (function(xs) {
  return ((xs === null) ? null : new $c_sci_ArraySeq$ofDouble(xs));
});
$c_sr_ScalaRunTime$.prototype.wrapBooleanArray__AZ__sci_ArraySeq = (function(xs) {
  return ((xs === null) ? null : new $c_sci_ArraySeq$ofBoolean(xs));
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass($c_sr_ScalaRunTime$, "scala.runtime.ScalaRunTime$", ({
  sr_ScalaRunTime$: 1
}));
var $n_sr_ScalaRunTime$;
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$();
  }
  return $n_sr_ScalaRunTime$;
}
/** @constructor */
function $c_sr_Statics$() {
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.longHash__J__I = (function(lv_$_lo, lv_$_hi) {
  return ((lv_$_hi === (lv_$_lo >> 31)) ? lv_$_lo : (lv_$_lo ^ lv_$_hi));
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv;
  } else {
    var $x_1 = $m_RTLong$().fromDouble__D__J(dv);
    var lv_$_lo = $x_1.l;
    var lv_$_hi = $x_1.h;
    if ((((4.294967296E9 * lv_$_hi) + (lv_$_lo >>> 0.0)) === dv)) {
      return (lv_$_lo ^ lv_$_hi);
    } else {
      var valueInt = (dv | 0);
      if (((valueInt === dv) && ((1.0 / dv) !== (-Infinity)))) {
        return valueInt;
      } else if ((dv !== dv)) {
        return 2146959360;
      } else {
        var fpBitsDataView = $fpBitsDataView;
        fpBitsDataView.setFloat64(0, dv, true);
        var lo = $uI(fpBitsDataView.getInt32(0, true));
        var hi = $uI(fpBitsDataView.getInt32(4, true));
        return (lo ^ hi);
      }
    }
  }
});
$c_sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0;
  } else if (((typeof x) === "number")) {
    var x3 = $uD(x);
    return this.doubleHash__D__I(x3);
  } else if ((x instanceof $Long)) {
    var $x_1 = $uJ(x);
    var x4_$_lo = $x_1.l;
    var x4_$_hi = $x_1.h;
    return this.longHash__J__I(x4_$_lo, x4_$_hi);
  } else {
    return $dp_hashCode__I($n(x));
  }
});
var $d_sr_Statics$ = new $TypeData().initClass($c_sr_Statics$, "scala.runtime.Statics$", ({
  sr_Statics$: 1
}));
var $n_sr_Statics$;
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$();
  }
  return $n_sr_Statics$;
}
/** @constructor */
function $c_sjsr_Compat$() {
}
$c_sjsr_Compat$.prototype = new $h_O();
$c_sjsr_Compat$.prototype.constructor = $c_sjsr_Compat$;
/** @constructor */
function $h_sjsr_Compat$() {
}
$h_sjsr_Compat$.prototype = $c_sjsr_Compat$.prototype;
$c_sjsr_Compat$.prototype.toJSVarArgsImpl__sci_Seq__sjs_js_Array = (function(seq) {
  if ((seq instanceof $c_sjsr_WrappedVarArgs)) {
    var x2 = $as_sjsr_WrappedVarArgs(seq);
    return $n(x2).sjsr_WrappedVarArgs__f_scala$scalajs$runtime$WrappedVarArgs$$array;
  } else {
    var result = [];
    $n(seq).foreach__F1__V(new $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(((x$2$2) => $uI(result.push(x$2$2)))));
    return result;
  }
});
var $d_sjsr_Compat$ = new $TypeData().initClass($c_sjsr_Compat$, "scala.scalajs.runtime.Compat$", ({
  sjsr_Compat$: 1
}));
var $n_sjsr_Compat$;
function $m_sjsr_Compat$() {
  if ((!$n_sjsr_Compat$)) {
    $n_sjsr_Compat$ = new $c_sjsr_Compat$();
  }
  return $n_sjsr_Compat$;
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return ((Math.imul(5, h) - 430675100) | 0);
});
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = Math.imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = Math.imul(461845907, k);
  return (hash ^ k);
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.scala$util$hashing$MurmurHash3$$avalanche__I__I((hash ^ length));
});
$c_s_util_hashing_MurmurHash3.prototype.scala$util$hashing$MurmurHash3$$avalanche__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = Math.imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = Math.imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h;
});
$c_s_util_hashing_MurmurHash3.prototype.tuple2Hash__I__I__I__I = (function(x, y, seed) {
  var h = seed;
  h = this.mix__I__I__I(h, $f_T__hashCode__I("Tuple2"));
  h = this.mix__I__I__I(h, x);
  h = this.mix__I__I__I(h, y);
  return this.finalizeHash__I__I__I(h, 2);
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__Z__I = (function(x, seed, ignorePrefix) {
  var arr = $n(x).productArity__I();
  if ((arr === 0)) {
    return ((!ignorePrefix) ? $f_T__hashCode__I($n($n(x).productPrefix__T())) : seed);
  } else {
    var h = seed;
    if ((!ignorePrefix)) {
      h = this.mix__I__I__I(h, $f_T__hashCode__I($n($n(x).productPrefix__T())));
    }
    var i = 0;
    while ((i < arr)) {
      var $x_1 = h;
      var x$1 = $n(x).productElement__I__O(i);
      h = this.mix__I__I__I($x_1, $m_sr_Statics$().anyHash__O__I(x$1));
      i = ((1 + i) | 0);
    }
    return this.finalizeHash__I__I__I(h, arr);
  }
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_IterableOnce__I__I = (function(xs, seed) {
  var a = 0;
  var b = 0;
  var n = 0;
  var c = 1;
  var iterator = $n(xs).iterator__sc_Iterator();
  while ($n(iterator).hasNext__Z()) {
    var x = $n(iterator).next__O();
    var h = $m_sr_Statics$().anyHash__O__I(x);
    a = ((a + h) | 0);
    b = (b ^ h);
    c = Math.imul(c, (1 | h));
    n = ((1 + n) | 0);
  }
  var h$2 = seed;
  h$2 = this.mix__I__I__I(h$2, a);
  h$2 = this.mix__I__I__I(h$2, b);
  h$2 = this.mixLast__I__I__I(h$2, c);
  return this.finalizeHash__I__I__I(h$2, n);
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_IterableOnce__I__I = (function(xs, seed) {
  var it = $n(xs).iterator__sc_Iterator();
  var h = seed;
  if ((!$n(it).hasNext__Z())) {
    return this.finalizeHash__I__I__I(h, 0);
  }
  var x0 = $n(it).next__O();
  if ((!$n(it).hasNext__Z())) {
    return this.finalizeHash__I__I__I(this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x0)), 1);
  }
  var x1 = $n(it).next__O();
  var initial = $m_sr_Statics$().anyHash__O__I(x0);
  h = this.mix__I__I__I(h, initial);
  var h0 = h;
  var prev = $m_sr_Statics$().anyHash__O__I(x1);
  var rangeDiff = ((prev - initial) | 0);
  var i = 2;
  while ($n(it).hasNext__Z()) {
    h = this.mix__I__I__I(h, prev);
    var x = $n(it).next__O();
    var hash = $m_sr_Statics$().anyHash__O__I(x);
    if (((rangeDiff !== ((hash - prev) | 0)) || (rangeDiff === 0))) {
      h = this.mix__I__I__I(h, hash);
      i = ((1 + i) | 0);
      while ($n(it).hasNext__Z()) {
        var $x_1 = h;
        var x$1 = $n(it).next__O();
        h = this.mix__I__I__I($x_1, $m_sr_Statics$().anyHash__O__I(x$1));
        i = ((1 + i) | 0);
      }
      return this.finalizeHash__I__I__I(h, i);
    }
    prev = hash;
    i = ((1 + i) | 0);
  }
  return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(h0, rangeDiff), prev));
});
$c_s_util_hashing_MurmurHash3.prototype.arrayHash__O__I__I = (function(a, seed) {
  var h = seed;
  var l = $m_jl_reflect_Array$().getLength__O__I(a);
  switch (l) {
    case 0: {
      return this.finalizeHash__I__I__I(h, 0);
      break;
    }
    case 1: {
      var $x_1 = h;
      var x = $m_sr_ScalaRunTime$().array_apply__O__I__O(a, 0);
      return this.finalizeHash__I__I__I(this.mix__I__I__I($x_1, $m_sr_Statics$().anyHash__O__I(x)), 1);
      break;
    }
    default: {
      var x$1 = $m_sr_ScalaRunTime$().array_apply__O__I__O(a, 0);
      var initial = $m_sr_Statics$().anyHash__O__I(x$1);
      h = this.mix__I__I__I(h, initial);
      var h0 = h;
      var x$2 = $m_sr_ScalaRunTime$().array_apply__O__I__O(a, 1);
      var prev = $m_sr_Statics$().anyHash__O__I(x$2);
      var rangeDiff = ((prev - initial) | 0);
      var i = 2;
      while ((i < l)) {
        h = this.mix__I__I__I(h, prev);
        var x$3 = $m_sr_ScalaRunTime$().array_apply__O__I__O(a, i);
        var hash = $m_sr_Statics$().anyHash__O__I(x$3);
        if (((rangeDiff !== ((hash - prev) | 0)) || (rangeDiff === 0))) {
          h = this.mix__I__I__I(h, hash);
          i = ((1 + i) | 0);
          while ((i < l)) {
            var $x_2 = h;
            var x$4 = $m_sr_ScalaRunTime$().array_apply__O__I__O(a, i);
            h = this.mix__I__I__I($x_2, $m_sr_Statics$().anyHash__O__I(x$4));
            i = ((1 + i) | 0);
          }
          return this.finalizeHash__I__I__I(h, l);
        }
        prev = hash;
        i = ((1 + i) | 0);
      }
      return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(h0, rangeDiff), prev));
    }
  }
});
$c_s_util_hashing_MurmurHash3.prototype.rangeHash__I__I__I__I__I = (function(start, step, last, seed) {
  return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(this.mix__I__I__I(seed, start), step), last));
});
$c_s_util_hashing_MurmurHash3.prototype.indexedSeqHash__sc_IndexedSeq__I__I = (function(a, seed) {
  var h = seed;
  var l = $n(a).length__I();
  switch (l) {
    case 0: {
      return this.finalizeHash__I__I__I(h, 0);
      break;
    }
    case 1: {
      var $x_1 = h;
      var x = $n(a).apply__I__O(0);
      return this.finalizeHash__I__I__I(this.mix__I__I__I($x_1, $m_sr_Statics$().anyHash__O__I(x)), 1);
      break;
    }
    default: {
      var x$1 = $n(a).apply__I__O(0);
      var initial = $m_sr_Statics$().anyHash__O__I(x$1);
      h = this.mix__I__I__I(h, initial);
      var h0 = h;
      var x$2 = $n(a).apply__I__O(1);
      var prev = $m_sr_Statics$().anyHash__O__I(x$2);
      var rangeDiff = ((prev - initial) | 0);
      var i = 2;
      while ((i < l)) {
        h = this.mix__I__I__I(h, prev);
        var x$3 = $n(a).apply__I__O(i);
        var hash = $m_sr_Statics$().anyHash__O__I(x$3);
        if (((rangeDiff !== ((hash - prev) | 0)) || (rangeDiff === 0))) {
          h = this.mix__I__I__I(h, hash);
          i = ((1 + i) | 0);
          while ((i < l)) {
            var $x_2 = h;
            var x$4 = $n(a).apply__I__O(i);
            h = this.mix__I__I__I($x_2, $m_sr_Statics$().anyHash__O__I(x$4));
            i = ((1 + i) | 0);
          }
          return this.finalizeHash__I__I__I(h, l);
        }
        prev = hash;
        i = ((1 + i) | 0);
      }
      return this.scala$util$hashing$MurmurHash3$$avalanche__I__I(this.mix__I__I__I(this.mix__I__I__I(h0, rangeDiff), prev));
    }
  }
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var rangeState = 0;
  var rangeDiff = 0;
  var prev = 0;
  var initial = 0;
  var elems = xs;
  while ((!$n(elems).isEmpty__Z())) {
    var head = $n(elems).head__O();
    var tail = $as_sci_List($n(elems).tail__O());
    var hash = $m_sr_Statics$().anyHash__O__I(head);
    h = this.mix__I__I__I(h, hash);
    var x1 = rangeState;
    switch (x1) {
      case 0: {
        initial = hash;
        rangeState = 1;
        break;
      }
      case 1: {
        rangeDiff = ((hash - prev) | 0);
        rangeState = 2;
        break;
      }
      case 2: {
        if (((rangeDiff !== ((hash - prev) | 0)) || (rangeDiff === 0))) {
          rangeState = 3;
        }
        break;
      }
    }
    prev = hash;
    n = ((1 + n) | 0);
    elems = tail;
  }
  return ((rangeState === 2) ? this.rangeHash__I__I__I__I__I(initial, rangeDiff, prev, seed) : this.finalizeHash__I__I__I(h, n));
});
/** @constructor */
function $c_jl_Character$() {
  this.jl_Character$__f_nonASCIIZeroDigitCodePoints = null;
  $n_jl_Character$ = this;
  this.jl_Character$__f_nonASCIIZeroDigitCodePoints = $constArrUDiffs_I(67, "1C]4m6m=c4]4]4]4]4]4]4]4]4]3g4]2m9]2m1Jm1m9s4g5mm6]3]4mm12>mEm1m6m1]3]=]DI]1<m24mIs4g2c4w9];]4]<]3m3m=m3mH]8]2m=mBHm3]4mK3{gggg2:g=m@]13]4E]");
}
$c_jl_Character$.prototype = new $h_O();
$c_jl_Character$.prototype.constructor = $c_jl_Character$;
/** @constructor */
function $h_jl_Character$() {
}
$h_jl_Character$.prototype = $c_jl_Character$.prototype;
$c_jl_Character$.prototype.digitWithValidRadix__I__I__I = (function(codePoint, radix) {
  if ((codePoint < 256)) {
    var value = (((((codePoint - 48) | 0) >>> 0) <= 9) ? ((codePoint - 48) | 0) : (((((codePoint - 65) | 0) >>> 0) <= 25) ? ((codePoint - 55) | 0) : (((((codePoint - 97) | 0) >>> 0) <= 25) ? ((codePoint - 87) | 0) : (-1))));
  } else if (((((codePoint - 65313) | 0) >>> 0) <= 25)) {
    var value = ((codePoint - 65303) | 0);
  } else if (((((codePoint - 65345) | 0) >>> 0) <= 25)) {
    var value = ((codePoint - 65335) | 0);
  } else {
    var p = $m_ju_Arrays$().binarySearch__AI__I__I(this.jl_Character$__f_nonASCIIZeroDigitCodePoints, codePoint);
    var zeroCodePointIndex = ((p < 0) ? (((-2) - p) | 0) : p);
    if ((zeroCodePointIndex < 0)) {
      var value = (-1);
    } else {
      var v = ((codePoint - $n(this.jl_Character$__f_nonASCIIZeroDigitCodePoints).get(zeroCodePointIndex)) | 0);
      var value = ((v > 9) ? (-1) : v);
    }
  }
  return ((value < radix) ? value : (-1));
});
var $d_jl_Character$ = new $TypeData().initClass($c_jl_Character$, "java.lang.Character$", ({
  jl_Character$: 1,
  Ljava_io_Serializable: 1
}));
var $n_jl_Character$;
function $m_jl_Character$() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$();
  }
  return $n_jl_Character$;
}
/** @constructor */
function $c_jl_Integer$() {
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.parseIntFail__T__E = (function(s) {
  throw new $c_jl_NumberFormatException((("For input string: \"" + s) + "\""));
});
$c_jl_Integer$.prototype.java$lang$Integer$$parseIntImpl__T__I__I__I = (function(s, radix, overflowBarrier) {
  if ((s === null)) {
    $m_jl_Integer$().parseIntFail__T__E(s);
  }
  var this$3 = $n(s);
  var len = this$3.length;
  if ((len === 0)) {
    $m_jl_Integer$().parseIntFail__T__E(s);
  }
  var character = $m_jl_Character$();
  var this$5 = $n(s);
  var firstChar = $charAt(this$5, 0);
  var negative = (firstChar === 45);
  var sign = (negative ? (-1) : 0);
  var i = ((negative || (firstChar === 43)) | 0);
  if ((i >= len)) {
    $m_jl_Integer$().parseIntFail__T__E(s);
  }
  var java$lang$IntFloatBits$Int32Box$$value = 0;
  java$lang$IntFloatBits$Int32Box$$value = 0;
  while ((i !== len)) {
    var this$7 = $n(s);
    var index = i;
    var x = character.digitWithValidRadix__I__I__I($charAt(this$7, index), radix);
    if ((x < 0)) {
      var $x_1 = true;
    } else {
      var x$1 = java$lang$IntFloatBits$Int32Box$$value;
      var $x_1 = ((x$1 >>> 0) > (overflowBarrier >>> 0));
    }
    if ($x_1) {
      $m_jl_Integer$().parseIntFail__T__E(s);
    }
    var x$2 = java$lang$IntFloatBits$Int32Box$$value;
    var x$3 = Math.imul(x$2, radix);
    var v = ((x$3 + x) | 0);
    java$lang$IntFloatBits$Int32Box$$value = v;
    i = ((1 + i) | 0);
  }
  var x$4 = java$lang$IntFloatBits$Int32Box$$value;
  var y = ((2147483647 - sign) | 0);
  if (((x$4 >>> 0) > (y >>> 0))) {
    $m_jl_Integer$().parseIntFail__T__E(s);
  }
  var x$5 = java$lang$IntFloatBits$Int32Box$$value;
  var x$6 = (x$5 ^ sign);
  return ((x$6 - sign) | 0);
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return (Math.imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24);
});
var $d_jl_Integer$ = new $TypeData().initClass($c_jl_Integer$, "java.lang.Integer$", ({
  jl_Integer$: 1,
  Ljava_io_Serializable: 1
}));
var $n_jl_Integer$;
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$();
  }
  return $n_jl_Integer$;
}
/** @constructor */
function $c_jl_Number() {
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (((obj instanceof $c_jl_Number) || ((typeof obj) === "number")) || (obj instanceof $Long));
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"));
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)));
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth));
}
function $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, e, enableSuppression, writableStackTrace) {
  $thiz.jl_Throwable__f_s = s;
  if (writableStackTrace) {
    $thiz.fillInStackTrace__jl_Throwable();
  }
  return $thiz;
}
class $c_jl_Throwable extends Error {
  constructor() {
    super();
    this.jl_Throwable__f_s = null;
  }
  getMessage__T() {
    return this.jl_Throwable__f_s;
  }
  fillInStackTrace__jl_Throwable() {
    var reference = (false ? this.sjs_js_JavaScriptException__f_exception : this);
    var identifyingString = Object.prototype.toString.call(reference);
    if ((identifyingString !== "[object Error]")) {
      if (((Error.captureStackTrace === (void 0)) || $uZ(Object.isSealed(this)))) {
        new Error();
      } else {
        Error.captureStackTrace(this);
      }
    }
    return this;
  }
  toString__T() {
    var className = $objectClassName(this);
    var message = this.getMessage__T();
    return ((message === null) ? className : ((className + ": ") + message));
  }
  hashCode__I() {
    return $c_O.prototype.hashCode__I.call(this);
  }
  equals__O__Z(that) {
    return $c_O.prototype.equals__O__Z.call(this, that);
  }
  get "message"() {
    var m = this.getMessage__T();
    return ((m === null) ? "" : m);
  }
  get "name"() {
    return $objectClassName(this);
  }
  "toString"() {
    return this.toString__T();
  }
}
/** @constructor */
function $c_s_LowPriorityImplicits() {
}
$c_s_LowPriorityImplicits.prototype = new $h_s_LowPriorityImplicits2();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
function $h_s_LowPriorityImplicits() {
}
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
/** @constructor */
function $c_sci_MapNode() {
}
$c_sci_MapNode.prototype = new $h_sci_Node();
$c_sci_MapNode.prototype.constructor = $c_sci_MapNode;
/** @constructor */
function $h_sci_MapNode() {
}
$h_sci_MapNode.prototype = $c_sci_MapNode.prototype;
function $as_sci_MapNode(obj) {
  return (((obj instanceof $c_sci_MapNode) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.MapNode"));
}
function $isArrayOf_sci_MapNode(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_MapNode)));
}
function $asArrayOf_sci_MapNode(obj, depth) {
  return (($isArrayOf_sci_MapNode(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.MapNode;", depth));
}
function $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable($thiz, elems) {
  if ((elems === $thiz)) {
    $thiz.addAll__sc_IterableOnce__scm_Growable($m_scm_Buffer$().from__sc_IterableOnce__sc_SeqOps(elems));
  } else {
    var it = $n(elems).iterator__sc_Iterator();
    while ($n(it).hasNext__Z()) {
      $thiz.addOne__O__scm_Growable($n(it).next__O());
    }
  }
  return $thiz;
}
/** @constructor */
function $c_sr_AbstractFunction0() {
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>";
});
/** @constructor */
function $c_sr_AbstractFunction1() {
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>";
});
/** @constructor */
function $c_sr_AbstractFunction2() {
}
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
function $h_sr_AbstractFunction2() {
}
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>";
});
/** @constructor */
function $c_sr_BooleanRef(elem) {
  this.sr_BooleanRef__f_elem = false;
  this.sr_BooleanRef__f_elem = elem;
}
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
function $h_sr_BooleanRef() {
}
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var b = this.sr_BooleanRef__f_elem;
  return ("" + b);
});
var $d_sr_BooleanRef = new $TypeData().initClass($c_sr_BooleanRef, "scala.runtime.BooleanRef", ({
  sr_BooleanRef: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sr_DoubleRef(elem) {
  this.sr_DoubleRef__f_elem = 0.0;
  this.sr_DoubleRef__f_elem = elem;
}
$c_sr_DoubleRef.prototype = new $h_O();
$c_sr_DoubleRef.prototype.constructor = $c_sr_DoubleRef;
/** @constructor */
function $h_sr_DoubleRef() {
}
$h_sr_DoubleRef.prototype = $c_sr_DoubleRef.prototype;
$c_sr_DoubleRef.prototype.toString__T = (function() {
  var d = this.sr_DoubleRef__f_elem;
  return ("" + d);
});
var $d_sr_DoubleRef = new $TypeData().initClass($c_sr_DoubleRef, "scala.runtime.DoubleRef", ({
  sr_DoubleRef: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sr_IntRef(elem) {
  this.sr_IntRef__f_elem = 0;
  this.sr_IntRef__f_elem = elem;
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var i = this.sr_IntRef__f_elem;
  return ("" + i);
});
var $d_sr_IntRef = new $TypeData().initClass($c_sr_IntRef, "scala.runtime.IntRef", ({
  sr_IntRef: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sr_ObjectRef(elem) {
  this.sr_ObjectRef__f_elem = null;
  this.sr_ObjectRef__f_elem = elem;
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  var obj = this.sr_ObjectRef__f_elem;
  return ("" + obj);
});
var $d_sr_ObjectRef = new $TypeData().initClass($c_sr_ObjectRef, "scala.runtime.ObjectRef", ({
  sr_ObjectRef: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  this.s_util_hashing_MurmurHash3$__f_seqSeed = 0;
  this.s_util_hashing_MurmurHash3$__f_mapSeed = 0;
  this.s_util_hashing_MurmurHash3$__f_setSeed = 0;
  this.s_util_hashing_MurmurHash3$__f_emptyMapHash = 0;
  $n_s_util_hashing_MurmurHash3$ = this;
  this.s_util_hashing_MurmurHash3$__f_seqSeed = $f_T__hashCode__I("Seq");
  this.s_util_hashing_MurmurHash3$__f_mapSeed = $f_T__hashCode__I("Map");
  this.s_util_hashing_MurmurHash3$__f_setSeed = $f_T__hashCode__I("Set");
  this.s_util_hashing_MurmurHash3$__f_emptyMapHash = this.unorderedHash__sc_IterableOnce__I__I($m_sci_Nil$(), this.s_util_hashing_MurmurHash3$__f_mapSeed);
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.tuple2Hash__O__O__I = (function(x, y) {
  return this.tuple2Hash__I__I__I__I($m_sr_Statics$().anyHash__O__I(x), $m_sr_Statics$().anyHash__O__I(y), (-889275714));
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sc_IndexedSeq(xs)) {
    var x2 = $as_sc_IndexedSeq(xs);
    return this.indexedSeqHash__sc_IndexedSeq__I__I(x2, this.s_util_hashing_MurmurHash3$__f_seqSeed);
  } else if ((xs instanceof $c_sci_List)) {
    var x3 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x3, this.s_util_hashing_MurmurHash3$__f_seqSeed);
  } else {
    return this.orderedHash__sc_IterableOnce__I__I(xs, this.s_util_hashing_MurmurHash3$__f_seqSeed);
  }
});
$c_s_util_hashing_MurmurHash3$.prototype.mapHash__sc_Map__I = (function(xs) {
  if ($n(xs).isEmpty__Z()) {
    return this.s_util_hashing_MurmurHash3$__f_emptyMapHash;
  } else {
    var accum = new $c_s_util_hashing_MurmurHash3$accum$1();
    var h = this.s_util_hashing_MurmurHash3$__f_mapSeed;
    $n(xs).foreachEntry__F2__V(accum);
    h = this.mix__I__I__I(h, accum.s_util_hashing_MurmurHash3$accum$1__f_a);
    h = this.mix__I__I__I(h, accum.s_util_hashing_MurmurHash3$accum$1__f_b);
    h = this.mixLast__I__I__I(h, accum.s_util_hashing_MurmurHash3$accum$1__f_c);
    return this.finalizeHash__I__I__I(h, accum.s_util_hashing_MurmurHash3$accum$1__f_n);
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass($c_s_util_hashing_MurmurHash3$, "scala.util.hashing.MurmurHash3$", ({
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1
}));
var $n_s_util_hashing_MurmurHash3$;
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$();
  }
  return $n_s_util_hashing_MurmurHash3$;
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3$accum$1() {
  this.s_util_hashing_MurmurHash3$accum$1__f_a = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_b = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_n = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_c = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_a = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_b = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_n = 0;
  this.s_util_hashing_MurmurHash3$accum$1__f_c = 1;
}
$c_s_util_hashing_MurmurHash3$accum$1.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3$accum$1.prototype.constructor = $c_s_util_hashing_MurmurHash3$accum$1;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$accum$1() {
}
$h_s_util_hashing_MurmurHash3$accum$1.prototype = $c_s_util_hashing_MurmurHash3$accum$1.prototype;
$c_s_util_hashing_MurmurHash3$accum$1.prototype.toString__T = (function() {
  return "<function2>";
});
$c_s_util_hashing_MurmurHash3$accum$1.prototype.apply__O__O__V = (function(k, v) {
  var h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(k, v);
  this.s_util_hashing_MurmurHash3$accum$1__f_a = ((this.s_util_hashing_MurmurHash3$accum$1__f_a + h) | 0);
  this.s_util_hashing_MurmurHash3$accum$1__f_b = (this.s_util_hashing_MurmurHash3$accum$1__f_b ^ h);
  this.s_util_hashing_MurmurHash3$accum$1__f_c = Math.imul(this.s_util_hashing_MurmurHash3$accum$1__f_c, (1 | h));
  this.s_util_hashing_MurmurHash3$accum$1__f_n = ((1 + this.s_util_hashing_MurmurHash3$accum$1__f_n) | 0);
});
$c_s_util_hashing_MurmurHash3$accum$1.prototype.apply__O__O__O = (function(v1, v2) {
  this.apply__O__O__V(v1, v2);
});
var $d_s_util_hashing_MurmurHash3$accum$1 = new $TypeData().initClass($c_s_util_hashing_MurmurHash3$accum$1, "scala.util.hashing.MurmurHash3$accum$1", ({
  s_util_hashing_MurmurHash3$accum$1: 1,
  F2: 1
}));
/** @constructor */
function $c_jl_Class($data) {
  this.data = $data;
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.data.isInterface ? "interface " : (this.data.isPrimitive ? "" : "class ")) + this.data.name);
});
var $d_jl_Class = new $TypeData().initClass($c_jl_Class, "java.lang.Class", ({
  jl_Class: 1,
  Ljava_io_Serializable: 1,
  jl_constant_Constable: 1
}));
class $c_jl_Error extends $c_jl_Throwable {
}
class $c_jl_Exception extends $c_jl_Throwable {
}
/** @constructor */
function $c_ju_Random(seed_in_$_lo, seed_in_$_hi) {
  this.ju_Random__f_java$util$Random$$seed_$lo = 0;
  this.ju_Random__f_java$util$Random$$seed_$hi = 0;
  this.setSeed__J__V(seed_in_$_lo, seed_in_$_hi);
}
$c_ju_Random.prototype = new $h_O();
$c_ju_Random.prototype.constructor = $c_ju_Random;
/** @constructor */
function $h_ju_Random() {
}
$h_ju_Random.prototype = $c_ju_Random.prototype;
$c_ju_Random.prototype.setSeed__J__V = (function(seed_in_$_lo, seed_in_$_hi) {
  var lo = ((-554899859) ^ seed_in_$_lo);
  var hi = (5 ^ seed_in_$_hi);
  var hi$1 = (65535 & hi);
  this.ju_Random__f_java$util$Random$$seed_$lo = lo;
  this.ju_Random__f_java$util$Random$$seed_$hi = hi$1;
});
$c_ju_Random.prototype.next__I__I = (function(bits) {
  var x_$_lo = this.ju_Random__f_java$util$Random$$seed_$lo;
  var x_$_hi = this.ju_Random__f_java$util$Random$$seed_$hi;
  var b0 = (65535 & x_$_lo);
  var b1 = ((x_$_lo >>> 16) | 0);
  var a1b0 = Math.imul(58989, b0);
  var lo = (a1b0 << 16);
  var hi = ((((((Math.imul((-429064192), x_$_hi) + Math.imul(384748, x_$_lo)) | 0) + Math.imul(58989, b1)) | 0) + ((a1b0 >>> 16) | 0)) | 0);
  var lo$1 = ((720896 + lo) | 0);
  var hi$1 = ((hi + (((lo$1 >>> 0) < 720896) | 0)) | 0);
  var lo$2 = (((lo$1 >>> 16) | 0) | (hi$1 << 16));
  var hi$2 = ((hi$1 >>> 16) | 0);
  this.ju_Random__f_java$util$Random$$seed_$lo = lo$2;
  this.ju_Random__f_java$util$Random$$seed_$hi = hi$2;
  return ((hi$1 >>> ((-bits) | 0)) | 0);
});
$c_ju_Random.prototype.nextDouble__D = (function() {
  return (1.1102230246251565E-16 * ((1.34217728E8 * this.next__I__I(26)) + this.next__I__I(27)));
});
var $d_ju_Random = new $TypeData().initClass($c_ju_Random, "java.util.Random", ({
  ju_Random: 1,
  ju_random_RandomGenerator: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_s_Predef$() {
  this.s_Predef$__f_Map = null;
  $n_s_Predef$ = this;
  $m_sci_List$();
  this.s_Predef$__f_Map = $m_sci_Map$();
}
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
function $h_s_Predef$() {
}
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw $ct_jl_IllegalArgumentException__T__(new $c_jl_IllegalArgumentException(), "requirement failed");
  }
});
var $d_s_Predef$ = new $TypeData().initClass($c_s_Predef$, "scala.Predef$", ({
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  s_LowPriorityImplicits2: 1
}));
var $n_s_Predef$;
function $m_s_Predef$() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$();
  }
  return $n_s_Predef$;
}
function $f_s_Product2__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz._1__O();
      break;
    }
    case 1: {
      return $thiz._2__O();
      break;
    }
    default: {
      throw $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), (n + " is out of bounds (min 0, max 1)"));
    }
  }
}
function $f_s_Product3__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.T3__f__1;
      break;
    }
    case 1: {
      return $thiz.T3__f__2;
      break;
    }
    case 2: {
      return $thiz.T3__f__3;
      break;
    }
    default: {
      throw $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), (n + " is out of bounds (min 0, max 2)"));
    }
  }
}
function $f_sc_Iterator__concat__F0__sc_Iterator($thiz, xs) {
  return new $c_sc_Iterator$ConcatIterator($thiz).concat__F0__sc_Iterator(xs);
}
function $f_sc_Iterator__sliceIterator__I__I__sc_Iterator($thiz, from, until) {
  var lo = ((from > 0) ? from : 0);
  var rest = ((until < 0) ? (-1) : ((until <= lo) ? 0 : ((until - lo) | 0)));
  return ((rest === 0) ? $m_sc_Iterator$().sc_Iterator$__f__empty : new $c_sc_Iterator$SliceIterator($thiz, lo, rest));
}
function $f_sc_Iterator__sameElements__sc_IterableOnce__Z($thiz, that) {
  var those = $n(that).iterator__sc_Iterator();
  while ($thiz.hasNext__Z()) {
    if ((!$n(those).hasNext__Z())) {
      return false;
    }
    var x = $thiz.next__O();
    var y = $n(those).next__O();
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(x, y))) {
      return false;
    }
  }
  return (!$n(those).hasNext__Z());
}
/** @constructor */
function $c_sc_Iterator$() {
  this.sc_Iterator$__f__empty = null;
  $n_sc_Iterator$ = this;
  this.sc_Iterator$__f__empty = new $c_sc_Iterator$$anon$19();
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
var $d_sc_Iterator$ = new $TypeData().initClass($c_sc_Iterator$, "scala.collection.Iterator$", ({
  sc_Iterator$: 1,
  Ljava_io_Serializable: 1,
  sc_IterableFactory: 1
}));
var $n_sc_Iterator$;
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$();
  }
  return $n_sc_Iterator$;
}
function $ct_sc_MapFactory$Delegate__sc_MapFactory__($thiz, delegate) {
  $thiz.sc_MapFactory$Delegate__f_delegate = delegate;
  return $thiz;
}
/** @constructor */
function $c_sc_MapFactory$Delegate() {
  this.sc_MapFactory$Delegate__f_delegate = null;
}
$c_sc_MapFactory$Delegate.prototype = new $h_O();
$c_sc_MapFactory$Delegate.prototype.constructor = $c_sc_MapFactory$Delegate;
/** @constructor */
function $h_sc_MapFactory$Delegate() {
}
$h_sc_MapFactory$Delegate.prototype = $c_sc_MapFactory$Delegate.prototype;
/** @constructor */
function $c_sci_BitmapIndexedMapNode(dataMap, nodeMap, content, originalHashes, size, cachedJavaKeySetHashCode) {
  this.sci_BitmapIndexedMapNode__f_dataMap = 0;
  this.sci_BitmapIndexedMapNode__f_nodeMap = 0;
  this.sci_BitmapIndexedMapNode__f_content = null;
  this.sci_BitmapIndexedMapNode__f_originalHashes = null;
  this.sci_BitmapIndexedMapNode__f_size = 0;
  this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode = 0;
  this.sci_BitmapIndexedMapNode__f_dataMap = dataMap;
  this.sci_BitmapIndexedMapNode__f_nodeMap = nodeMap;
  this.sci_BitmapIndexedMapNode__f_content = content;
  this.sci_BitmapIndexedMapNode__f_originalHashes = originalHashes;
  this.sci_BitmapIndexedMapNode__f_size = size;
  this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode = cachedJavaKeySetHashCode;
}
$c_sci_BitmapIndexedMapNode.prototype = new $h_sci_MapNode();
$c_sci_BitmapIndexedMapNode.prototype.constructor = $c_sci_BitmapIndexedMapNode;
/** @constructor */
function $h_sci_BitmapIndexedMapNode() {
}
$h_sci_BitmapIndexedMapNode.prototype = $c_sci_BitmapIndexedMapNode.prototype;
$c_sci_BitmapIndexedMapNode.prototype.size__I = (function() {
  return this.sci_BitmapIndexedMapNode__f_size;
});
$c_sci_BitmapIndexedMapNode.prototype.cachedJavaKeySetHashCode__I = (function() {
  return this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode;
});
$c_sci_BitmapIndexedMapNode.prototype.getKey__I__O = (function(index) {
  return $n(this.sci_BitmapIndexedMapNode__f_content).get((index << 1));
});
$c_sci_BitmapIndexedMapNode.prototype.getValue__I__O = (function(index) {
  return $n(this.sci_BitmapIndexedMapNode__f_content).get(((1 + (index << 1)) | 0));
});
$c_sci_BitmapIndexedMapNode.prototype.getPayload__I__T2 = (function(index) {
  var _1 = $n(this.sci_BitmapIndexedMapNode__f_content).get((index << 1));
  var _2 = $n(this.sci_BitmapIndexedMapNode__f_content).get(((1 + (index << 1)) | 0));
  return new $c_T2(_1, _2);
});
$c_sci_BitmapIndexedMapNode.prototype.getHash__I__I = (function(index) {
  return $n(this.sci_BitmapIndexedMapNode__f_originalHashes).get(index);
});
$c_sci_BitmapIndexedMapNode.prototype.getNode__I__sci_MapNode = (function(index) {
  return $as_sci_MapNode($n(this.sci_BitmapIndexedMapNode__f_content).get((((($n(this.sci_BitmapIndexedMapNode__f_content).u.length - 1) | 0) - index) | 0)));
});
$c_sci_BitmapIndexedMapNode.prototype.apply__O__I__I__I__O = (function(key, originalHash, keyHash, shift) {
  var mask = $m_sci_Node$().maskFrom__I__I__I(keyHash, shift);
  var bitpos = $m_sci_Node$().bitposFrom__I__I(mask);
  if (((this.sci_BitmapIndexedMapNode__f_dataMap & bitpos) !== 0)) {
    var index = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_dataMap, mask, bitpos);
    var y = this.getKey__I__O(index);
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
      return this.getValue__I__O(index);
    } else {
      throw new $c_ju_NoSuchElementException(("key not found: " + key));
    }
  } else if (((this.sci_BitmapIndexedMapNode__f_nodeMap & bitpos) !== 0)) {
    return $n(this.getNode__I__sci_MapNode($m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_nodeMap, mask, bitpos))).apply__O__I__I__I__O(key, originalHash, keyHash, ((5 + shift) | 0));
  } else {
    throw new $c_ju_NoSuchElementException(("key not found: " + key));
  }
});
$c_sci_BitmapIndexedMapNode.prototype.get__O__I__I__I__s_Option = (function(key, originalHash, keyHash, shift) {
  var mask = $m_sci_Node$().maskFrom__I__I__I(keyHash, shift);
  var bitpos = $m_sci_Node$().bitposFrom__I__I(mask);
  if (((this.sci_BitmapIndexedMapNode__f_dataMap & bitpos) !== 0)) {
    var index = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_dataMap, mask, bitpos);
    var key0 = this.getKey__I__O(index);
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, key0)) {
      var value = this.getValue__I__O(index);
      return new $c_s_Some(value);
    } else {
      return $m_s_None$();
    }
  } else if (((this.sci_BitmapIndexedMapNode__f_nodeMap & bitpos) !== 0)) {
    var index$2 = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_nodeMap, mask, bitpos);
    return $n(this.getNode__I__sci_MapNode(index$2)).get__O__I__I__I__s_Option(key, originalHash, keyHash, ((5 + shift) | 0));
  } else {
    return $m_s_None$();
  }
});
$c_sci_BitmapIndexedMapNode.prototype.getOrElse__O__I__I__I__F0__O = (function(key, originalHash, keyHash, shift, f) {
  var mask = $m_sci_Node$().maskFrom__I__I__I(keyHash, shift);
  var bitpos = $m_sci_Node$().bitposFrom__I__I(mask);
  if (((this.sci_BitmapIndexedMapNode__f_dataMap & bitpos) !== 0)) {
    var index = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_dataMap, mask, bitpos);
    var key0 = this.getKey__I__O(index);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(key, key0) ? this.getValue__I__O(index) : $n(f).apply__O());
  } else if (((this.sci_BitmapIndexedMapNode__f_nodeMap & bitpos) !== 0)) {
    var index$2 = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_nodeMap, mask, bitpos);
    return $n(this.getNode__I__sci_MapNode(index$2)).getOrElse__O__I__I__I__F0__O(key, originalHash, keyHash, ((5 + shift) | 0), f);
  } else {
    return $n(f).apply__O();
  }
});
$c_sci_BitmapIndexedMapNode.prototype.containsKey__O__I__I__I__Z = (function(key, originalHash, keyHash, shift) {
  var mask = $m_sci_Node$().maskFrom__I__I__I(keyHash, shift);
  var bitpos = $m_sci_Node$().bitposFrom__I__I(mask);
  if (((this.sci_BitmapIndexedMapNode__f_dataMap & bitpos) !== 0)) {
    var index = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_dataMap, mask, bitpos);
    if (($n(this.sci_BitmapIndexedMapNode__f_originalHashes).get(index) === originalHash)) {
      var y = this.getKey__I__O(index);
      return $m_sr_BoxesRunTime$().equals__O__O__Z(key, y);
    } else {
      return false;
    }
  } else {
    return (((this.sci_BitmapIndexedMapNode__f_nodeMap & bitpos) !== 0) && $n(this.getNode__I__sci_MapNode($m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_nodeMap, mask, bitpos))).containsKey__O__I__I__I__Z(key, originalHash, keyHash, ((5 + shift) | 0)));
  }
});
$c_sci_BitmapIndexedMapNode.prototype.updated__O__O__I__I__I__Z__sci_BitmapIndexedMapNode = (function(key, value, originalHash, keyHash, shift, replaceValue) {
  var mask = $m_sci_Node$().maskFrom__I__I__I(keyHash, shift);
  var bitpos = $m_sci_Node$().bitposFrom__I__I(mask);
  if (((this.sci_BitmapIndexedMapNode__f_dataMap & bitpos) !== 0)) {
    var index = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_dataMap, mask, bitpos);
    var key0 = this.getKey__I__O(index);
    var key0UnimprovedHash = this.getHash__I__I(index);
    if (((key0UnimprovedHash === originalHash) && $m_sr_BoxesRunTime$().equals__O__O__Z(key0, key))) {
      if (replaceValue) {
        var value0 = this.getValue__I__O(index);
        return ((Object.is(key0, key) && Object.is(value0, value)) ? this : this.copyAndSetValue__I__O__O__sci_BitmapIndexedMapNode(bitpos, key, value));
      } else {
        return this;
      }
    } else {
      var value0$2 = this.getValue__I__O(index);
      var key0Hash = $m_sc_Hashing$().improve__I__I(key0UnimprovedHash);
      var subNodeNew = this.mergeTwoKeyValPairs__O__O__I__I__O__O__I__I__I__sci_MapNode(key0, value0$2, key0UnimprovedHash, key0Hash, key, value, originalHash, keyHash, ((5 + shift) | 0));
      return this.copyAndMigrateFromInlineToNode__I__I__sci_MapNode__sci_BitmapIndexedMapNode(bitpos, key0Hash, subNodeNew);
    }
  } else if (((this.sci_BitmapIndexedMapNode__f_nodeMap & bitpos) !== 0)) {
    var index$2 = $m_sci_Node$().indexFrom__I__I__I__I(this.sci_BitmapIndexedMapNode__f_nodeMap, mask, bitpos);
    var subNode = this.getNode__I__sci_MapNode(index$2);
    var subNodeNew$2 = $n(subNode).updated__O__O__I__I__I__Z__sci_MapNode(key, value, originalHash, keyHash, ((5 + shift) | 0), replaceValue);
    return ((subNodeNew$2 === subNode) ? this : this.copyAndSetNode__I__sci_MapNode__sci_MapNode__sci_BitmapIndexedMapNode(bitpos, subNode, subNodeNew$2));
  } else {
    return this.copyAndInsertValue__I__O__I__I__O__sci_BitmapIndexedMapNode(bitpos, key, originalHash, keyHash, value);
  }
});
$c_sci_BitmapIndexedMapNode.prototype.mergeTwoKeyValPairs__O__O__I__I__O__O__I__I__I__sci_MapNode = (function(key0, value0, originalHash0, keyHash0, key1, value1, originalHash1, keyHash1, shift) {
  if ((shift >= 32)) {
    var this$6 = $m_sci_Vector$();
    var x0 = new $c_T2(key0, value0);
    var x1 = new $c_T2(key1, value1);
    var array = [x0, x1];
    var elems = new $c_sjsr_WrappedVarArgs(array);
    return new $c_sci_HashCollisionMapNode(originalHash0, keyHash0, this$6.from__sc_IterableOnce__sci_Vector(elems));
  } else {
    var mask0 = $m_sci_Node$().maskFrom__I__I__I(keyHash0, shift);
    var mask1 = $m_sci_Node$().maskFrom__I__I__I(keyHash1, shift);
    var newCachedHash = ((keyHash0 + keyHash1) | 0);
    if ((mask0 !== mask1)) {
      var dataMap = ($m_sci_Node$().bitposFrom__I__I(mask0) | $m_sci_Node$().bitposFrom__I__I(mask1));
      if ((mask0 < mask1)) {
        var array$1 = [key0, value0, key1, value1];
        var xs = new $c_sjsr_WrappedVarArgs(array$1);
        var length = xs.length__I();
        var array$2 = new $ac_O(length);
        var this$12 = new $c_sc_IndexedSeqView$Id(xs);
        var iterator = $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this$12);
        var i = 0;
        while ((iterator.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder > 0)) {
          array$2.set(i, iterator.next__O());
          i = ((1 + i) | 0);
        }
        return new $c_sci_BitmapIndexedMapNode(dataMap, 0, array$2, new $ac_I(new Int32Array([originalHash0, originalHash1])), 2, newCachedHash);
      } else {
        var array$3 = [key1, value1, key0, value0];
        var xs$1 = new $c_sjsr_WrappedVarArgs(array$3);
        var length$1 = xs$1.length__I();
        var array$4 = new $ac_O(length$1);
        var this$18 = new $c_sc_IndexedSeqView$Id(xs$1);
        var iterator$1 = $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this$18);
        var i$1 = 0;
        while ((iterator$1.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder > 0)) {
          array$4.set(i$1, iterator$1.next__O());
          i$1 = ((1 + i$1) | 0);
        }
        return new $c_sci_BitmapIndexedMapNode(dataMap, 0, array$4, new $ac_I(new Int32Array([originalHash1, originalHash0])), 2, newCachedHash);
      }
    } else {
      var nodeMap = $m_sci_Node$().bitposFrom__I__I(mask0);
      var node = this.mergeTwoKeyValPairs__O__O__I__I__O__O__I__I__I__sci_MapNode(key0, value0, originalHash0, keyHash0, key1, value1, originalHash1, keyHash1, ((5 + shift) | 0));
      var array$5 = [node];
      var xs$2 = new $c_sjsr_WrappedVarArgs(array$5);
      var length$2 = xs$2.length__I();
      var array$6 = new $ac_O(length$2);
      var this$24 = new $c_sc_IndexedSeqView$Id(xs$2);
      var iterator$2 = $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this$24);
      var i$2 = 0;
      while ((iterator$2.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder > 0)) {
        array$6.set(i$2, iterator$2.next__O());
        i$2 = ((1 + i$2) | 0);
      }
      return new $c_sci_BitmapIndexedMapNode(0, nodeMap, array$6, $m_s_Array$EmptyArrays$().s_Array$EmptyArrays$__f_emptyIntArray, $n(node).size__I(), $n(node).cachedJavaKeySetHashCode__I());
    }
  }
});
$c_sci_BitmapIndexedMapNode.prototype.hasNodes__Z = (function() {
  return (this.sci_BitmapIndexedMapNode__f_nodeMap !== 0);
});
$c_sci_BitmapIndexedMapNode.prototype.nodeArity__I = (function() {
  var i = this.sci_BitmapIndexedMapNode__f_nodeMap;
  return $m_jl_Integer$().bitCount__I__I(i);
});
$c_sci_BitmapIndexedMapNode.prototype.hasPayload__Z = (function() {
  return (this.sci_BitmapIndexedMapNode__f_dataMap !== 0);
});
$c_sci_BitmapIndexedMapNode.prototype.payloadArity__I = (function() {
  var i = this.sci_BitmapIndexedMapNode__f_dataMap;
  return $m_jl_Integer$().bitCount__I__I(i);
});
$c_sci_BitmapIndexedMapNode.prototype.dataIndex__I__I = (function(bitpos) {
  var i = (this.sci_BitmapIndexedMapNode__f_dataMap & ((bitpos - 1) | 0));
  return $m_jl_Integer$().bitCount__I__I(i);
});
$c_sci_BitmapIndexedMapNode.prototype.nodeIndex__I__I = (function(bitpos) {
  var i = (this.sci_BitmapIndexedMapNode__f_nodeMap & ((bitpos - 1) | 0));
  return $m_jl_Integer$().bitCount__I__I(i);
});
$c_sci_BitmapIndexedMapNode.prototype.copyAndSetValue__I__O__O__sci_BitmapIndexedMapNode = (function(bitpos, newKey, newValue) {
  var dataIx = this.dataIndex__I__I(bitpos);
  var idx = (dataIx << 1);
  var src = this.sci_BitmapIndexedMapNode__f_content;
  var dst = new $ac_O($n(src).u.length);
  var length = $n(src).u.length;
  $systemArraycopyRefs($n(src), 0, dst, 0, length);
  dst.set(((1 + idx) | 0), newValue);
  return new $c_sci_BitmapIndexedMapNode(this.sci_BitmapIndexedMapNode__f_dataMap, this.sci_BitmapIndexedMapNode__f_nodeMap, dst, this.sci_BitmapIndexedMapNode__f_originalHashes, this.sci_BitmapIndexedMapNode__f_size, this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode);
});
$c_sci_BitmapIndexedMapNode.prototype.copyAndSetNode__I__sci_MapNode__sci_MapNode__sci_BitmapIndexedMapNode = (function(bitpos, oldNode, newNode) {
  var idx = (((($n(this.sci_BitmapIndexedMapNode__f_content).u.length - 1) | 0) - this.nodeIndex__I__I(bitpos)) | 0);
  var src = this.sci_BitmapIndexedMapNode__f_content;
  var dst = new $ac_O($n(src).u.length);
  var length = $n(src).u.length;
  $systemArraycopyRefs($n(src), 0, dst, 0, length);
  dst.set(idx, newNode);
  return new $c_sci_BitmapIndexedMapNode(this.sci_BitmapIndexedMapNode__f_dataMap, this.sci_BitmapIndexedMapNode__f_nodeMap, dst, this.sci_BitmapIndexedMapNode__f_originalHashes, ((((this.sci_BitmapIndexedMapNode__f_size - $n(oldNode).size__I()) | 0) + $n(newNode).size__I()) | 0), ((((this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode - $n(oldNode).cachedJavaKeySetHashCode__I()) | 0) + $n(newNode).cachedJavaKeySetHashCode__I()) | 0));
});
$c_sci_BitmapIndexedMapNode.prototype.copyAndInsertValue__I__O__I__I__O__sci_BitmapIndexedMapNode = (function(bitpos, key, originalHash, keyHash, value) {
  var dataIx = this.dataIndex__I__I(bitpos);
  var idx = (dataIx << 1);
  var src = this.sci_BitmapIndexedMapNode__f_content;
  var dst = new $ac_O(((2 + $n(src).u.length) | 0));
  $systemArraycopyRefs($n(src), 0, dst, 0, idx);
  dst.set(idx, key);
  dst.set(((1 + idx) | 0), value);
  var destPos = ((2 + idx) | 0);
  var length = (($n(src).u.length - idx) | 0);
  $systemArraycopyRefs($n(src), idx, dst, destPos, length);
  var dstHashes = this.insertElement__AI__I__I__AI(this.sci_BitmapIndexedMapNode__f_originalHashes, dataIx, originalHash);
  return new $c_sci_BitmapIndexedMapNode((this.sci_BitmapIndexedMapNode__f_dataMap | bitpos), this.sci_BitmapIndexedMapNode__f_nodeMap, dst, dstHashes, ((1 + this.sci_BitmapIndexedMapNode__f_size) | 0), ((this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode + keyHash) | 0));
});
$c_sci_BitmapIndexedMapNode.prototype.migrateFromInlineToNodeInPlace__I__I__sci_MapNode__sci_BitmapIndexedMapNode = (function(bitpos, keyHash, node) {
  var dataIx = this.dataIndex__I__I(bitpos);
  var idxOld = (dataIx << 1);
  var idxNew = (((($n(this.sci_BitmapIndexedMapNode__f_content).u.length - 2) | 0) - this.nodeIndex__I__I(bitpos)) | 0);
  var src = this.sci_BitmapIndexedMapNode__f_content;
  var dst = new $ac_O((($n(src).u.length - 1) | 0));
  $systemArraycopyRefs($n(src), 0, dst, 0, idxOld);
  var srcPos = ((2 + idxOld) | 0);
  var length = ((idxNew - idxOld) | 0);
  $systemArraycopyRefs($n(src), srcPos, dst, idxOld, length);
  dst.set(idxNew, node);
  var srcPos$1 = ((2 + idxNew) | 0);
  var destPos = ((1 + idxNew) | 0);
  var length$1 = (((($n(src).u.length - idxNew) | 0) - 2) | 0);
  $systemArraycopyRefs($n(src), srcPos$1, dst, destPos, length$1);
  var dstHashes = this.removeElement__AI__I__AI(this.sci_BitmapIndexedMapNode__f_originalHashes, dataIx);
  this.sci_BitmapIndexedMapNode__f_dataMap = (this.sci_BitmapIndexedMapNode__f_dataMap ^ bitpos);
  this.sci_BitmapIndexedMapNode__f_nodeMap = (this.sci_BitmapIndexedMapNode__f_nodeMap | bitpos);
  this.sci_BitmapIndexedMapNode__f_content = dst;
  this.sci_BitmapIndexedMapNode__f_originalHashes = dstHashes;
  this.sci_BitmapIndexedMapNode__f_size = ((((this.sci_BitmapIndexedMapNode__f_size - 1) | 0) + $n(node).size__I()) | 0);
  this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode = ((((this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode - keyHash) | 0) + $n(node).cachedJavaKeySetHashCode__I()) | 0);
  return this;
});
$c_sci_BitmapIndexedMapNode.prototype.copyAndMigrateFromInlineToNode__I__I__sci_MapNode__sci_BitmapIndexedMapNode = (function(bitpos, keyHash, node) {
  var dataIx = this.dataIndex__I__I(bitpos);
  var idxOld = (dataIx << 1);
  var idxNew = (((($n(this.sci_BitmapIndexedMapNode__f_content).u.length - 2) | 0) - this.nodeIndex__I__I(bitpos)) | 0);
  var src = this.sci_BitmapIndexedMapNode__f_content;
  var dst = new $ac_O((($n(src).u.length - 1) | 0));
  $systemArraycopyRefs($n(src), 0, dst, 0, idxOld);
  var srcPos = ((2 + idxOld) | 0);
  var length = ((idxNew - idxOld) | 0);
  $systemArraycopyRefs($n(src), srcPos, dst, idxOld, length);
  dst.set(idxNew, node);
  var srcPos$1 = ((2 + idxNew) | 0);
  var destPos = ((1 + idxNew) | 0);
  var length$1 = (((($n(src).u.length - idxNew) | 0) - 2) | 0);
  $systemArraycopyRefs($n(src), srcPos$1, dst, destPos, length$1);
  var dstHashes = this.removeElement__AI__I__AI(this.sci_BitmapIndexedMapNode__f_originalHashes, dataIx);
  return new $c_sci_BitmapIndexedMapNode((this.sci_BitmapIndexedMapNode__f_dataMap ^ bitpos), (this.sci_BitmapIndexedMapNode__f_nodeMap | bitpos), dst, dstHashes, ((((this.sci_BitmapIndexedMapNode__f_size - 1) | 0) + $n(node).size__I()) | 0), ((((this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode - keyHash) | 0) + $n(node).cachedJavaKeySetHashCode__I()) | 0));
});
$c_sci_BitmapIndexedMapNode.prototype.foreachEntry__F2__V = (function(f) {
  var i = this.sci_BitmapIndexedMapNode__f_dataMap;
  var iN = $m_jl_Integer$().bitCount__I__I(i);
  var i$1 = 0;
  while ((i$1 < iN)) {
    $n(f).apply__O__O__O(this.getKey__I__O(i$1), this.getValue__I__O(i$1));
    i$1 = ((1 + i$1) | 0);
  }
  var i$2 = this.sci_BitmapIndexedMapNode__f_nodeMap;
  var jN = $m_jl_Integer$().bitCount__I__I(i$2);
  var j = 0;
  while ((j < jN)) {
    $n(this.getNode__I__sci_MapNode(j)).foreachEntry__F2__V(f);
    j = ((1 + j) | 0);
  }
});
$c_sci_BitmapIndexedMapNode.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_sci_BitmapIndexedMapNode)) {
    var node = $as_sci_BitmapIndexedMapNode(that);
    if ((this === node)) {
      return true;
    } else {
      if (((((this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode === $n(node).sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode) && (this.sci_BitmapIndexedMapNode__f_nodeMap === $n(node).sci_BitmapIndexedMapNode__f_nodeMap)) && (this.sci_BitmapIndexedMapNode__f_dataMap === $n(node).sci_BitmapIndexedMapNode__f_dataMap)) && (this.sci_BitmapIndexedMapNode__f_size === $n(node).sci_BitmapIndexedMapNode__f_size))) {
        var a = this.sci_BitmapIndexedMapNode__f_originalHashes;
        var b = $n(node).sci_BitmapIndexedMapNode__f_originalHashes;
        var $x_1 = $m_ju_Arrays$().equals__AI__AI__Z(a, b);
      } else {
        var $x_1 = false;
      }
      if ($x_1) {
        var a1 = this.sci_BitmapIndexedMapNode__f_content;
        var a2 = $n(node).sci_BitmapIndexedMapNode__f_content;
        var length = $n(this.sci_BitmapIndexedMapNode__f_content).u.length;
        if ((a1 === a2)) {
          return true;
        } else {
          var isEqual = true;
          var i = 0;
          while ((isEqual && (i < length))) {
            var x = $n(a1).get(i);
            var y = $n(a2).get(i);
            isEqual = $m_sr_BoxesRunTime$().equals__O__O__Z(x, y);
            i = ((1 + i) | 0);
          }
          return isEqual;
        }
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
});
$c_sci_BitmapIndexedMapNode.prototype.hashCode__I = (function() {
  throw new $c_jl_UnsupportedOperationException("Trie nodes do not support hashing.");
});
$c_sci_BitmapIndexedMapNode.prototype.toString__T = (function() {
  var i = $systemIdentityHashCode(this);
  return (($objectClassName(this) + "@") + $as_T((i >>> 0.0).toString(16)));
});
$c_sci_BitmapIndexedMapNode.prototype.copy__sci_BitmapIndexedMapNode = (function() {
  var this$1 = $n(this.sci_BitmapIndexedMapNode__f_content);
  var contentClone = this$1.clone__O();
  var contentLength = contentClone.u.length;
  var i = this.sci_BitmapIndexedMapNode__f_dataMap;
  var i$1 = ($m_jl_Integer$().bitCount__I__I(i) << 1);
  while ((i$1 < contentLength)) {
    contentClone.set(i$1, $n($as_sci_MapNode(contentClone.get(i$1))).copy__sci_MapNode());
    i$1 = ((1 + i$1) | 0);
  }
  var $x_2 = this.sci_BitmapIndexedMapNode__f_dataMap;
  var $x_1 = this.sci_BitmapIndexedMapNode__f_nodeMap;
  var this$2 = $n(this.sci_BitmapIndexedMapNode__f_originalHashes);
  return new $c_sci_BitmapIndexedMapNode($x_2, $x_1, contentClone, this$2.clone__O(), this.sci_BitmapIndexedMapNode__f_size, this.sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode);
});
$c_sci_BitmapIndexedMapNode.prototype.getNode__I__sci_Node = (function(index) {
  return this.getNode__I__sci_MapNode(index);
});
$c_sci_BitmapIndexedMapNode.prototype.updated__O__O__I__I__I__Z__sci_MapNode = (function(key, value, originalHash, hash, shift, replaceValue) {
  return this.updated__O__O__I__I__I__Z__sci_BitmapIndexedMapNode(key, value, originalHash, hash, shift, replaceValue);
});
$c_sci_BitmapIndexedMapNode.prototype.copy__sci_MapNode = (function() {
  return this.copy__sci_BitmapIndexedMapNode();
});
function $as_sci_BitmapIndexedMapNode(obj) {
  return (((obj instanceof $c_sci_BitmapIndexedMapNode) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.BitmapIndexedMapNode"));
}
function $isArrayOf_sci_BitmapIndexedMapNode(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_BitmapIndexedMapNode)));
}
function $asArrayOf_sci_BitmapIndexedMapNode(obj, depth) {
  return (($isArrayOf_sci_BitmapIndexedMapNode(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.BitmapIndexedMapNode;", depth));
}
var $d_sci_BitmapIndexedMapNode = new $TypeData().initClass($c_sci_BitmapIndexedMapNode, "scala.collection.immutable.BitmapIndexedMapNode", ({
  sci_BitmapIndexedMapNode: 1,
  sci_MapNode: 1,
  sci_Node: 1
}));
/** @constructor */
function $c_sci_HashCollisionMapNode(originalHash, hash, content) {
  this.sci_HashCollisionMapNode__f_originalHash = 0;
  this.sci_HashCollisionMapNode__f_hash = 0;
  this.sci_HashCollisionMapNode__f_content = null;
  this.sci_HashCollisionMapNode__f_originalHash = originalHash;
  this.sci_HashCollisionMapNode__f_hash = hash;
  this.sci_HashCollisionMapNode__f_content = content;
  $m_s_Predef$().require__Z__V(($n(this.sci_HashCollisionMapNode__f_content).length__I() >= 2));
}
$c_sci_HashCollisionMapNode.prototype = new $h_sci_MapNode();
$c_sci_HashCollisionMapNode.prototype.constructor = $c_sci_HashCollisionMapNode;
/** @constructor */
function $h_sci_HashCollisionMapNode() {
}
$h_sci_HashCollisionMapNode.prototype = $c_sci_HashCollisionMapNode.prototype;
$c_sci_HashCollisionMapNode.prototype.indexOf__O__I = (function(key) {
  var iter = $n(this.sci_HashCollisionMapNode__f_content).iterator__sc_Iterator();
  var i = 0;
  while ($n(iter).hasNext__Z()) {
    var x = $n($as_T2($n(iter).next__O()))._1__O();
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(x, key)) {
      return i;
    }
    i = ((1 + i) | 0);
  }
  return (-1);
});
$c_sci_HashCollisionMapNode.prototype.size__I = (function() {
  return $n(this.sci_HashCollisionMapNode__f_content).length__I();
});
$c_sci_HashCollisionMapNode.prototype.apply__O__I__I__I__O = (function(key, originalHash, hash, shift) {
  var this$1 = $n(this.get__O__I__I__I__s_Option(key, originalHash, hash, shift));
  return (this$1.isEmpty__Z() ? $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O() : this$1.get__O());
});
$c_sci_HashCollisionMapNode.prototype.get__O__I__I__I__s_Option = (function(key, originalHash, hash, shift) {
  if ((this.sci_HashCollisionMapNode__f_hash === hash)) {
    var index = this.indexOf__O__I(key);
    if ((index >= 0)) {
      var value = $n($as_T2($n(this.sci_HashCollisionMapNode__f_content).apply__I__O(index)))._2__O();
      return new $c_s_Some(value);
    } else {
      return $m_s_None$();
    }
  } else {
    return $m_s_None$();
  }
});
$c_sci_HashCollisionMapNode.prototype.getOrElse__O__I__I__I__F0__O = (function(key, originalHash, hash, shift, f) {
  if ((this.sci_HashCollisionMapNode__f_hash === hash)) {
    var x36 = this.indexOf__O__I(key);
    if ((x36 === (-1))) {
      return $n(f).apply__O();
    }
    return $n($as_T2($n(this.sci_HashCollisionMapNode__f_content).apply__I__O(x36)))._2__O();
  } else {
    return $n(f).apply__O();
  }
});
$c_sci_HashCollisionMapNode.prototype.containsKey__O__I__I__I__Z = (function(key, originalHash, hash, shift) {
  return ((this.sci_HashCollisionMapNode__f_hash === hash) && (this.indexOf__O__I(key) >= 0));
});
$c_sci_HashCollisionMapNode.prototype.updated__O__O__I__I__I__Z__sci_MapNode = (function(key, value, originalHash, hash, shift, replaceValue) {
  var index = this.indexOf__O__I(key);
  return ((index >= 0) ? (replaceValue ? (Object.is($n($as_T2($n(this.sci_HashCollisionMapNode__f_content).apply__I__O(index)))._2__O(), value) ? this : new $c_sci_HashCollisionMapNode(originalHash, hash, $n(this.sci_HashCollisionMapNode__f_content).updated__I__O__sci_Vector(index, new $c_T2(key, value)))) : this) : new $c_sci_HashCollisionMapNode(originalHash, hash, $n(this.sci_HashCollisionMapNode__f_content).appended__O__sci_Vector(new $c_T2(key, value))));
});
$c_sci_HashCollisionMapNode.prototype.hasNodes__Z = (function() {
  return false;
});
$c_sci_HashCollisionMapNode.prototype.nodeArity__I = (function() {
  return 0;
});
$c_sci_HashCollisionMapNode.prototype.getNode__I__sci_MapNode = (function(index) {
  throw $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), "No sub-nodes present in hash-collision leaf node.");
});
$c_sci_HashCollisionMapNode.prototype.hasPayload__Z = (function() {
  return true;
});
$c_sci_HashCollisionMapNode.prototype.payloadArity__I = (function() {
  return $n(this.sci_HashCollisionMapNode__f_content).length__I();
});
$c_sci_HashCollisionMapNode.prototype.getKey__I__O = (function(index) {
  return $n($as_T2($n(this.sci_HashCollisionMapNode__f_content).apply__I__O(index)))._1__O();
});
$c_sci_HashCollisionMapNode.prototype.getValue__I__O = (function(index) {
  return $n($as_T2($n(this.sci_HashCollisionMapNode__f_content).apply__I__O(index)))._2__O();
});
$c_sci_HashCollisionMapNode.prototype.getPayload__I__T2 = (function(index) {
  return $as_T2($n(this.sci_HashCollisionMapNode__f_content).apply__I__O(index));
});
$c_sci_HashCollisionMapNode.prototype.getHash__I__I = (function(index) {
  return this.sci_HashCollisionMapNode__f_originalHash;
});
$c_sci_HashCollisionMapNode.prototype.foreachEntry__F2__V = (function(f) {
  $n(this.sci_HashCollisionMapNode__f_content).foreach__F1__V(new $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(((x$1$2) => {
    var x$1 = $as_T2(x$1$2);
    var k = $n(x$1)._1__O();
    var v = $n(x$1)._2__O();
    return $n(f).apply__O__O__O(k, v);
  })));
});
$c_sci_HashCollisionMapNode.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_sci_HashCollisionMapNode)) {
    var node = $as_sci_HashCollisionMapNode(that);
    if ((this === node)) {
      return true;
    } else if (((this.sci_HashCollisionMapNode__f_hash === $n(node).sci_HashCollisionMapNode__f_hash) && ($n(this.sci_HashCollisionMapNode__f_content).length__I() === $n($n(node).sci_HashCollisionMapNode__f_content).length__I()))) {
      var iter = $n(this.sci_HashCollisionMapNode__f_content).iterator__sc_Iterator();
      while ($n(iter).hasNext__Z()) {
        var x47 = $as_T2($n(iter).next__O());
        $n(x47)._1__O();
        $n(x47)._2__O();
        var \u03b412$ = x47;
        var key$2 = $n(\u03b412$)._1__O();
        var value$2 = $n(\u03b412$)._2__O();
        var index = $n(node).indexOf__O__I(key$2);
        if ((index < 0)) {
          var $x_1 = true;
        } else {
          var y = $n($as_T2($n($n(node).sci_HashCollisionMapNode__f_content).apply__I__O(index)))._2__O();
          var $x_1 = (!$m_sr_BoxesRunTime$().equals__O__O__Z(value$2, y));
        }
        if ($x_1) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
});
$c_sci_HashCollisionMapNode.prototype.hashCode__I = (function() {
  throw new $c_jl_UnsupportedOperationException("Trie nodes do not support hashing.");
});
$c_sci_HashCollisionMapNode.prototype.toString__T = (function() {
  var i = $systemIdentityHashCode(this);
  return (($objectClassName(this) + "@") + $as_T((i >>> 0.0).toString(16)));
});
$c_sci_HashCollisionMapNode.prototype.cachedJavaKeySetHashCode__I = (function() {
  return Math.imul($n(this.sci_HashCollisionMapNode__f_content).length__I(), this.sci_HashCollisionMapNode__f_hash);
});
$c_sci_HashCollisionMapNode.prototype.getNode__I__sci_Node = (function(index) {
  return this.getNode__I__sci_MapNode(index);
});
$c_sci_HashCollisionMapNode.prototype.copy__sci_MapNode = (function() {
  return new $c_sci_HashCollisionMapNode(this.sci_HashCollisionMapNode__f_originalHash, this.sci_HashCollisionMapNode__f_hash, this.sci_HashCollisionMapNode__f_content);
});
function $as_sci_HashCollisionMapNode(obj) {
  return (((obj instanceof $c_sci_HashCollisionMapNode) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashCollisionMapNode"));
}
function $isArrayOf_sci_HashCollisionMapNode(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashCollisionMapNode)));
}
function $asArrayOf_sci_HashCollisionMapNode(obj, depth) {
  return (($isArrayOf_sci_HashCollisionMapNode(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashCollisionMapNode;", depth));
}
var $d_sci_HashCollisionMapNode = new $TypeData().initClass($c_sci_HashCollisionMapNode, "scala.collection.immutable.HashCollisionMapNode", ({
  sci_HashCollisionMapNode: 1,
  sci_MapNode: 1,
  sci_Node: 1
}));
/** @constructor */
function $c_sci_HashMap$() {
  this.sci_HashMap$__f_EmptyMap = null;
  $n_sci_HashMap$ = this;
  this.sci_HashMap$__f_EmptyMap = new $c_sci_HashMap($m_sci_MapNode$().sci_MapNode$__f_EmptyMapNode);
}
$c_sci_HashMap$.prototype = new $h_O();
$c_sci_HashMap$.prototype.constructor = $c_sci_HashMap$;
/** @constructor */
function $h_sci_HashMap$() {
}
$h_sci_HashMap$.prototype = $c_sci_HashMap$.prototype;
var $d_sci_HashMap$ = new $TypeData().initClass($c_sci_HashMap$, "scala.collection.immutable.HashMap$", ({
  sci_HashMap$: 1,
  Ljava_io_Serializable: 1,
  sc_MapFactory: 1
}));
var $n_sci_HashMap$;
function $m_sci_HashMap$() {
  if ((!$n_sci_HashMap$)) {
    $n_sci_HashMap$ = new $c_sci_HashMap$();
  }
  return $n_sci_HashMap$;
}
/** @constructor */
function $c_sci_Map$() {
}
$c_sci_Map$.prototype = new $h_O();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.from__sc_IterableOnce__sci_Map = (function(it) {
  if ($is_sci_Iterable(it)) {
    var it$2 = $as_sci_Iterable(it);
    if ($n(it$2).isEmpty__Z()) {
      return $m_sci_Map$EmptyMap$();
    }
  }
  if ((it instanceof $c_sci_HashMap)) {
    var m = $as_sci_HashMap(it);
    return m;
  }
  if ((it instanceof $c_sci_Map$Map1)) {
    var m$2 = $as_sci_Map$Map1(it);
    return m$2;
  }
  if ((it instanceof $c_sci_Map$Map2)) {
    var m$3 = $as_sci_Map$Map2(it);
    return m$3;
  }
  if ((it instanceof $c_sci_Map$Map3)) {
    var m$4 = $as_sci_Map$Map3(it);
    return m$4;
  }
  if ((it instanceof $c_sci_Map$Map4)) {
    var m$5 = $as_sci_Map$Map4(it);
    return m$5;
  }
  if (false) {
    var m$6 = $as_sci_ListMap(it);
    return m$6;
  }
  if (false) {
    var m$7 = $as_sci_TreeSeqMap(it);
    return m$7;
  }
  if (false) {
    var m$8 = $as_sci_VectorMap(it);
    return m$8;
  }
  if (false) {
    var m$9 = $as_sci_SeqMap$SeqMap1(it);
    return m$9;
  }
  if (false) {
    var m$10 = $as_sci_SeqMap$SeqMap2(it);
    return m$10;
  }
  if (false) {
    var m$11 = $as_sci_SeqMap$SeqMap3(it);
    return m$11;
  }
  if (false) {
    var m$12 = $as_sci_SeqMap$SeqMap4(it);
    return m$12;
  }
  var this$1 = new $c_sci_MapBuilderImpl();
  var this$2 = $n(this$1.addAll__sc_IterableOnce__sci_MapBuilderImpl(it));
  return this$2.result__sci_Map();
});
var $d_sci_Map$ = new $TypeData().initClass($c_sci_Map$, "scala.collection.immutable.Map$", ({
  sci_Map$: 1,
  Ljava_io_Serializable: 1,
  sc_MapFactory: 1
}));
var $n_sci_Map$;
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$();
  }
  return $n_sci_Map$;
}
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)));
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"));
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)));
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth));
}
function $as_s_math_ScalaNumber(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"));
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)));
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth));
}
/** @constructor */
function $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c(f) {
  this.sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c__f_f = null;
  this.sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c__f_f = f;
}
$c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c.prototype = new $h_sr_AbstractFunction0();
$c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c.prototype.constructor = $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c;
/** @constructor */
function $h_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c() {
}
$h_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c.prototype = $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c.prototype;
$c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c.prototype.apply__O = (function() {
  return $n(this.sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c__f_f)();
});
var $d_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c = new $TypeData().initClass($c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c, "scala.runtime.AbstractFunction0.$$Lambda$07eded5776954a9c145e92c329afd52873ad179c", ({
  sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c: 1,
  sr_AbstractFunction0: 1,
  F0: 1
}));
/** @constructor */
function $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(f) {
  this.sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919__f_f = null;
  this.sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919__f_f = f;
}
$c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919.prototype = new $h_sr_AbstractFunction1();
$c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919.prototype.constructor = $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919;
/** @constructor */
function $h_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919() {
}
$h_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919.prototype = $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919.prototype;
$c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919.prototype.apply__O__O = (function(x0) {
  return $n(this.sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919__f_f)(x0);
});
var $d_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919 = new $TypeData().initClass($c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919, "scala.runtime.AbstractFunction1.$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919", ({
  sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919: 1,
  sr_AbstractFunction1: 1,
  F1: 1
}));
/** @constructor */
function $c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8(f) {
  this.sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8__f_f = null;
  this.sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8__f_f = f;
}
$c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8.prototype = new $h_sr_AbstractFunction2();
$c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8.prototype.constructor = $c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8;
/** @constructor */
function $h_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8() {
}
$h_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8.prototype = $c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8.prototype;
$c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8.prototype.apply__O__O__O = (function(x0, x1) {
  return $n(this.sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8__f_f)(x0, x1);
});
var $d_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8 = new $TypeData().initClass($c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8, "scala.runtime.AbstractFunction2.$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8", ({
  sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8: 1,
  sr_AbstractFunction2: 1,
  F2: 1
}));
function $f_jl_Boolean__equals__O__Z($thiz, that) {
  return ($thiz === that);
}
function $f_jl_Boolean__hashCode__I($thiz) {
  return ($thiz ? 1231 : 1237);
}
function $f_jl_Boolean__toString__T($thiz) {
  return ("" + $thiz);
}
var $d_jl_Boolean = new $TypeData().initClass(0, "java.lang.Boolean", ({
  jl_Boolean: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1
}), ((x) => ((typeof x) === "boolean")));
function $f_jl_Character__hashCode__I($thiz) {
  return $thiz;
}
function $f_jl_Character__equals__O__Z($thiz, that) {
  if ((that instanceof $Char)) {
    var this$1 = $n($as_jl_Character(that)).c;
    return ($thiz === this$1);
  } else {
    return false;
  }
}
function $f_jl_Character__toString__T($thiz) {
  return ("" + $cToS($thiz));
}
function $as_jl_Character(obj) {
  return (((obj instanceof $Char) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"));
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)));
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth));
}
var $d_jl_Character = new $TypeData().initClass(0, "java.lang.Character", ({
  jl_Character: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1
}), ((x) => (x instanceof $Char)));
function $ct_jl_RuntimeException__T__($thiz, s) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, null, true, true);
  return $thiz;
}
class $c_jl_RuntimeException extends $c_jl_Exception {
}
var $d_jl_RuntimeException = new $TypeData().initClass($c_jl_RuntimeException, "java.lang.RuntimeException", ({
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_jl_StringBuilder() {
  this.jl_StringBuilder__f_java$lang$StringBuilder$$content = null;
  this.jl_StringBuilder__f_java$lang$StringBuilder$$content = "";
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.jl_StringBuilder__f_java$lang$StringBuilder$$content;
});
$c_jl_StringBuilder.prototype.length__I = (function() {
  var this$1 = $n(this.jl_StringBuilder__f_java$lang$StringBuilder$$content);
  return this$1.length;
});
$c_jl_StringBuilder.prototype.charAt__I__C = (function(index) {
  var this$1 = $n(this.jl_StringBuilder__f_java$lang$StringBuilder$$content);
  return $charAt(this$1, index);
});
var $d_jl_StringBuilder = new $TypeData().initClass($c_jl_StringBuilder, "java.lang.StringBuilder", ({
  jl_StringBuilder: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
}));
class $c_jl_VirtualMachineError extends $c_jl_Error {
}
/** @constructor */
function $c_sc_AbstractIterator() {
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.knownSize__I = (function() {
  return (-1);
});
$c_sc_AbstractIterator.prototype.copyToArray__O__I__I__I = (function(dest, start, n) {
  return $f_sc_IterableOnceOps__copyToArray__O__I__I__I(this, dest, start, n);
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end);
});
$c_sc_AbstractIterator.prototype.iterator__sc_Iterator = (function() {
  return this;
});
$c_sc_AbstractIterator.prototype.drop__I__sc_Iterator = (function(n) {
  return this.sliceIterator__I__I__sc_Iterator(n, (-1));
});
$c_sc_AbstractIterator.prototype.sliceIterator__I__I__sc_Iterator = (function(from, until) {
  return $f_sc_Iterator__sliceIterator__I__I__sc_Iterator(this, from, until);
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return "<iterator>";
});
/** @constructor */
function $c_sc_Map$() {
  this.sc_MapFactory$Delegate__f_delegate = null;
  this.sc_Map$__f_DefaultSentinel = null;
  this.sc_Map$__f_scala$collection$Map$$$DefaultSentinelFn = null;
  $ct_sc_MapFactory$Delegate__sc_MapFactory__(this, $m_sci_Map$());
  $n_sc_Map$ = this;
  this.sc_Map$__f_DefaultSentinel = $ct_O__(new $c_O());
  this.sc_Map$__f_scala$collection$Map$$$DefaultSentinelFn = new $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c((() => this.sc_Map$__f_DefaultSentinel));
}
$c_sc_Map$.prototype = new $h_sc_MapFactory$Delegate();
$c_sc_Map$.prototype.constructor = $c_sc_Map$;
/** @constructor */
function $h_sc_Map$() {
}
$h_sc_Map$.prototype = $c_sc_Map$.prototype;
var $d_sc_Map$ = new $TypeData().initClass($c_sc_Map$, "scala.collection.Map$", ({
  sc_Map$: 1,
  sc_MapFactory$Delegate: 1,
  Ljava_io_Serializable: 1,
  sc_MapFactory: 1
}));
var $n_sc_Map$;
function $m_sc_Map$() {
  if ((!$n_sc_Map$)) {
    $n_sc_Map$ = new $c_sc_Map$();
  }
  return $n_sc_Map$;
}
function $ct_sc_SeqFactory$Delegate__sc_SeqFactory__($thiz, delegate) {
  $thiz.sc_SeqFactory$Delegate__f_delegate = delegate;
  return $thiz;
}
/** @constructor */
function $c_sc_SeqFactory$Delegate() {
  this.sc_SeqFactory$Delegate__f_delegate = null;
}
$c_sc_SeqFactory$Delegate.prototype = new $h_O();
$c_sc_SeqFactory$Delegate.prototype.constructor = $c_sc_SeqFactory$Delegate;
/** @constructor */
function $h_sc_SeqFactory$Delegate() {
}
$h_sc_SeqFactory$Delegate.prototype = $c_sc_SeqFactory$Delegate.prototype;
$c_sc_SeqFactory$Delegate.prototype.from__sc_IterableOnce__sc_SeqOps = (function(it) {
  return $as_sc_SeqOps($n(this.sc_SeqFactory$Delegate__f_delegate).from__sc_IterableOnce__O(it));
});
$c_sc_SeqFactory$Delegate.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sc_SeqOps(source);
});
function $f_sc_SeqOps__isEmpty__Z($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0);
}
function $f_sc_SeqOps__sameElements__sc_IterableOnce__Z($thiz, that) {
  var thisKnownSize = $thiz.knownSize__I();
  if ((thisKnownSize !== (-1))) {
    var thatKnownSize = $n(that).knownSize__I();
    if ((thatKnownSize !== (-1))) {
      if ((thisKnownSize !== thatKnownSize)) {
        return false;
      }
      if ((thisKnownSize === 0)) {
        return true;
      }
    }
  }
  var this$1 = $n($thiz.iterator__sc_Iterator());
  return $f_sc_Iterator__sameElements__sc_IterableOnce__Z(this$1, that);
}
function $is_sc_SeqOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_SeqOps)));
}
function $as_sc_SeqOps(obj) {
  return (($is_sc_SeqOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.SeqOps"));
}
function $isArrayOf_sc_SeqOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_SeqOps)));
}
function $asArrayOf_sc_SeqOps(obj, depth) {
  return (($isArrayOf_sc_SeqOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.SeqOps;", depth));
}
class $c_jl_ArithmeticException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_jl_ArithmeticException = new $TypeData().initClass($c_jl_ArithmeticException, "java.lang.ArithmeticException", ({
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
class $c_jl_ArrayStoreException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_jl_ArrayStoreException = new $TypeData().initClass($c_jl_ArrayStoreException, "java.lang.ArrayStoreException", ({
  jl_ArrayStoreException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $f_jl_Byte__equals__O__Z($thiz, that) {
  return Object.is($thiz, that);
}
function $f_jl_Byte__hashCode__I($thiz) {
  return $thiz;
}
function $f_jl_Byte__toString__T($thiz) {
  return ("" + $thiz);
}
var $d_jl_Byte = new $TypeData().initClass(0, "java.lang.Byte", ({
  jl_Byte: 1,
  jl_Number: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1
}), ((x) => $isByte(x)));
class $c_jl_ClassCastException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
function $as_jl_ClassCastException(obj) {
  return (((obj instanceof $c_jl_ClassCastException) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"));
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)));
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth));
}
var $d_jl_ClassCastException = new $TypeData().initClass($c_jl_ClassCastException, "java.lang.ClassCastException", ({
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $ct_jl_IllegalArgumentException__T__($thiz, s) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, null, true, true);
  return $thiz;
}
function $ct_jl_IllegalArgumentException__($thiz) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, null, null, true, true);
  return $thiz;
}
class $c_jl_IllegalArgumentException extends $c_jl_RuntimeException {
}
var $d_jl_IllegalArgumentException = new $TypeData().initClass($c_jl_IllegalArgumentException, "java.lang.IllegalArgumentException", ({
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
class $c_jl_IllegalStateException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_jl_IllegalStateException = new $TypeData().initClass($c_jl_IllegalStateException, "java.lang.IllegalStateException", ({
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $ct_jl_IndexOutOfBoundsException__T__($thiz, s) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, null, true, true);
  return $thiz;
}
function $ct_jl_IndexOutOfBoundsException__I__($thiz, index) {
  var s = ("Index out of range: " + index);
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, null, true, true);
  return $thiz;
}
class $c_jl_IndexOutOfBoundsException extends $c_jl_RuntimeException {
}
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass($c_jl_IndexOutOfBoundsException, "java.lang.IndexOutOfBoundsException", ({
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
class $c_jl_NegativeArraySizeException extends $c_jl_RuntimeException {
  constructor() {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, null, null, true, true);
  }
}
var $d_jl_NegativeArraySizeException = new $TypeData().initClass($c_jl_NegativeArraySizeException, "java.lang.NegativeArraySizeException", ({
  jl_NegativeArraySizeException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $ct_jl_NullPointerException__T__($thiz, s) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, null, true, true);
  return $thiz;
}
function $ct_jl_NullPointerException__($thiz) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, null, null, true, true);
  return $thiz;
}
class $c_jl_NullPointerException extends $c_jl_RuntimeException {
}
var $d_jl_NullPointerException = new $TypeData().initClass($c_jl_NullPointerException, "java.lang.NullPointerException", ({
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $as_jl_SecurityException(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.SecurityException"));
}
function $isArrayOf_jl_SecurityException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_SecurityException)));
}
function $asArrayOf_jl_SecurityException(obj, depth) {
  return (($isArrayOf_jl_SecurityException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.SecurityException;", depth));
}
function $f_jl_Short__equals__O__Z($thiz, that) {
  return Object.is($thiz, that);
}
function $f_jl_Short__hashCode__I($thiz) {
  return $thiz;
}
function $f_jl_Short__toString__T($thiz) {
  return ("" + $thiz);
}
var $d_jl_Short = new $TypeData().initClass(0, "java.lang.Short", ({
  jl_Short: 1,
  jl_Number: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1
}), ((x) => $isShort(x)));
class $c_jl_UnsupportedOperationException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_jl_UnsupportedOperationException = new $TypeData().initClass($c_jl_UnsupportedOperationException, "java.lang.UnsupportedOperationException", ({
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
class $c_ju_ConcurrentModificationException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_ju_ConcurrentModificationException = new $TypeData().initClass($c_ju_ConcurrentModificationException, "java.util.ConcurrentModificationException", ({
  ju_ConcurrentModificationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
class $c_ju_NoSuchElementException extends $c_jl_RuntimeException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_ju_NoSuchElementException = new $TypeData().initClass($c_ju_NoSuchElementException, "java.util.NoSuchElementException", ({
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
class $c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError extends $c_jl_VirtualMachineError {
  constructor(cause) {
    super();
    var message = ((cause === null) ? null : $n(cause).toString__T());
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, message, cause, true, true);
  }
}
var $d_Lorg_scalajs_linker_runtime_UndefinedBehaviorError = new $TypeData().initClass($c_Lorg_scalajs_linker_runtime_UndefinedBehaviorError, "org.scalajs.linker.runtime.UndefinedBehaviorError", ({
  Lorg_scalajs_linker_runtime_UndefinedBehaviorError: 1,
  jl_VirtualMachineError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $p_s_MatchError__objString__T($thiz) {
  if ((!$thiz.s_MatchError__f_objStringbitmap$1)) {
    if (($thiz.s_MatchError__f_obj === null)) {
      var $x_1 = "null";
    } else {
      var this$1 = $n($thiz.s_MatchError__f_obj);
      var cls = $objectGetClass(this$1);
      if ((cls === null)) {
        var ofClass = "of a JS class";
      } else {
        var this$2 = $n(cls);
        var ofClass = ("of class " + this$2.data.name);
      }
      try {
        var $x_1 = ((($thiz.s_MatchError__f_obj + " (") + ofClass) + ")");
      } catch (e) {
        var $x_1 = ("an instance " + ofClass);
      }
    }
    $thiz.s_MatchError__f_objString$lzy1 = $x_1;
    $thiz.s_MatchError__f_objStringbitmap$1 = true;
  }
  return $thiz.s_MatchError__f_objString$lzy1;
}
class $c_s_MatchError extends $c_jl_RuntimeException {
  constructor(obj) {
    super();
    this.s_MatchError__f_obj = null;
    this.s_MatchError__f_objString$lzy1 = null;
    this.s_MatchError__f_objStringbitmap$1 = false;
    this.s_MatchError__f_obj = obj;
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, null, null, true, true);
  }
  getMessage__T() {
    return $p_s_MatchError__objString__T(this);
  }
}
var $d_s_MatchError = new $TypeData().initClass($c_s_MatchError, "scala.MatchError", ({
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_s_Option() {
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
}
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.productIterator__sc_Iterator = (function() {
  return new $c_s_Product$$anon$1(this);
});
$c_s_Option.prototype.isEmpty__Z = (function() {
  return (this === $m_s_None$());
});
$c_s_Option.prototype.knownSize__I = (function() {
  return ((!this.isEmpty__Z()) | 0);
});
$c_s_Option.prototype.iterator__sc_Iterator = (function() {
  if (this.isEmpty__Z()) {
    return $m_sc_Iterator$().sc_Iterator$__f__empty;
  } else {
    var a = this.get__O();
    return new $c_sc_Iterator$$anon$20(a);
  }
});
/** @constructor */
function $c_s_Product$$anon$1(outer) {
  this.s_Product$$anon$1__f_c = 0;
  this.s_Product$$anon$1__f_cmax = 0;
  this.s_Product$$anon$1__f_$outer = null;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  this.s_Product$$anon$1__f_$outer = outer;
  this.s_Product$$anon$1__f_c = 0;
  this.s_Product$$anon$1__f_cmax = $n(outer).productArity__I();
}
$c_s_Product$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_s_Product$$anon$1.prototype.constructor = $c_s_Product$$anon$1;
/** @constructor */
function $h_s_Product$$anon$1() {
}
$h_s_Product$$anon$1.prototype = $c_s_Product$$anon$1.prototype;
$c_s_Product$$anon$1.prototype.hasNext__Z = (function() {
  return (this.s_Product$$anon$1__f_c < this.s_Product$$anon$1__f_cmax);
});
$c_s_Product$$anon$1.prototype.next__O = (function() {
  var result = $n(this.s_Product$$anon$1__f_$outer).productElement__I__O(this.s_Product$$anon$1__f_c);
  this.s_Product$$anon$1__f_c = ((1 + this.s_Product$$anon$1__f_c) | 0);
  return result;
});
var $d_s_Product$$anon$1 = new $TypeData().initClass($c_s_Product$$anon$1, "scala.Product$$anon$1", ({
  s_Product$$anon$1: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_T2(_1, _2) {
  this.T2__f__1 = null;
  this.T2__f__2 = null;
  this.T2__f__1 = _1;
  this.T2__f__2 = _2;
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productArity__I = (function() {
  return 2;
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $f_s_Product2__productElement__I__O(this, n);
});
$c_T2.prototype._1__O = (function() {
  return this.T2__f__1;
});
$c_T2.prototype._2__O = (function() {
  return this.T2__f__2;
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this._1__O()) + ",") + this._2__O()) + ")");
});
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2";
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1(this);
});
$c_T2.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().productHash__s_Product__I__Z__I(this, (-116390334), true);
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true;
  } else if ((x$1 instanceof $c_T2)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this._1__O(), $n(Tuple2$1)._1__O()) && $m_sr_BoxesRunTime$().equals__O__O__Z(this._2__O(), $n(Tuple2$1)._2__O()));
  } else {
    return false;
  }
});
$c_T2.prototype._1$mcD$sp__D = (function() {
  return $uD(this._1__O());
});
$c_T2.prototype._2$mcD$sp__D = (function() {
  return $uD(this._2__O());
});
function $as_T2(obj) {
  return (((obj instanceof $c_T2) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"));
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)));
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth));
}
var $d_T2 = new $TypeData().initClass($c_T2, "scala.Tuple2", ({
  T2: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_T3(_1, _2, _3) {
  this.T3__f__1 = null;
  this.T3__f__2 = null;
  this.T3__f__3 = null;
  this.T3__f__1 = _1;
  this.T3__f__2 = _2;
  this.T3__f__3 = _3;
}
$c_T3.prototype = new $h_O();
$c_T3.prototype.constructor = $c_T3;
/** @constructor */
function $h_T3() {
}
$h_T3.prototype = $c_T3.prototype;
$c_T3.prototype.productIterator__sc_Iterator = (function() {
  return new $c_s_Product$$anon$1(this);
});
$c_T3.prototype.productArity__I = (function() {
  return 3;
});
$c_T3.prototype.productElement__I__O = (function(n) {
  return $f_s_Product3__productElement__I__O(this, n);
});
$c_T3.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().productHash__s_Product__I__Z__I(this, (-192629203), true);
});
$c_T3.prototype.equals__O__Z = (function(x$0) {
  if ((this === x$0)) {
    return true;
  } else if ((x$0 instanceof $c_T3)) {
    var x$0$2 = $as_T3(x$0);
    var x = this.T3__f__1;
    var y = $n(x$0$2).T3__f__1;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(x, y)) {
      var x$1 = this.T3__f__2;
      var y$1 = $n(x$0$2).T3__f__2;
      var $x_1 = $m_sr_BoxesRunTime$().equals__O__O__Z(x$1, y$1);
    } else {
      var $x_1 = false;
    }
    if ($x_1) {
      var x$2 = this.T3__f__3;
      var y$2 = $n(x$0$2).T3__f__3;
      return $m_sr_BoxesRunTime$().equals__O__O__Z(x$2, y$2);
    } else {
      return false;
    }
  } else {
    return false;
  }
});
$c_T3.prototype.productPrefix__T = (function() {
  return "Tuple3";
});
$c_T3.prototype.toString__T = (function() {
  return (((((("(" + this.T3__f__1) + ",") + this.T3__f__2) + ",") + this.T3__f__3) + ")");
});
function $as_T3(obj) {
  return (((obj instanceof $c_T3) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple3"));
}
function $isArrayOf_T3(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T3)));
}
function $asArrayOf_T3(obj, depth) {
  return (($isArrayOf_T3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple3;", depth));
}
var $d_T3 = new $TypeData().initClass($c_T3, "scala.Tuple3", ({
  T3: 1,
  s_Equals: 1,
  s_Product: 1,
  s_Product3: 1,
  Ljava_io_Serializable: 1
}));
function $f_sc_Iterable__toString__T($thiz) {
  return $f_sc_IterableOnceOps__mkString__T__T__T__T($thiz, ($thiz.className__T() + "("), ", ", ")");
}
function $is_sc_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Iterable)));
}
function $as_sc_Iterable(obj) {
  return (($is_sc_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Iterable"));
}
function $isArrayOf_sc_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterable)));
}
function $asArrayOf_sc_Iterable(obj, depth) {
  return (($isArrayOf_sc_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Iterable;", depth));
}
/** @constructor */
function $c_sc_Iterator$$anon$19() {
}
$c_sc_Iterator$$anon$19.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$19.prototype.constructor = $c_sc_Iterator$$anon$19;
/** @constructor */
function $h_sc_Iterator$$anon$19() {
}
$h_sc_Iterator$$anon$19.prototype = $c_sc_Iterator$$anon$19.prototype;
$c_sc_Iterator$$anon$19.prototype.hasNext__Z = (function() {
  return false;
});
$c_sc_Iterator$$anon$19.prototype.next__E = (function() {
  throw new $c_ju_NoSuchElementException("next on empty iterator");
});
$c_sc_Iterator$$anon$19.prototype.knownSize__I = (function() {
  return 0;
});
$c_sc_Iterator$$anon$19.prototype.next__O = (function() {
  this.next__E();
});
$c_sc_Iterator$$anon$19.prototype.sliceIterator__I__I__sc_Iterator = (function(from, until) {
  return this;
});
var $d_sc_Iterator$$anon$19 = new $TypeData().initClass($c_sc_Iterator$$anon$19, "scala.collection.Iterator$$anon$19", ({
  sc_Iterator$$anon$19: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sc_Iterator$$anon$20(a$2) {
  this.sc_Iterator$$anon$20__f_a$1 = null;
  this.sc_Iterator$$anon$20__f_consumed = false;
  this.sc_Iterator$$anon$20__f_a$1 = a$2;
  this.sc_Iterator$$anon$20__f_consumed = false;
}
$c_sc_Iterator$$anon$20.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$20.prototype.constructor = $c_sc_Iterator$$anon$20;
/** @constructor */
function $h_sc_Iterator$$anon$20() {
}
$h_sc_Iterator$$anon$20.prototype = $c_sc_Iterator$$anon$20.prototype;
$c_sc_Iterator$$anon$20.prototype.hasNext__Z = (function() {
  return (!this.sc_Iterator$$anon$20__f_consumed);
});
$c_sc_Iterator$$anon$20.prototype.next__O = (function() {
  if (this.sc_Iterator$$anon$20__f_consumed) {
    return $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  } else {
    this.sc_Iterator$$anon$20__f_consumed = true;
    return this.sc_Iterator$$anon$20__f_a$1;
  }
});
$c_sc_Iterator$$anon$20.prototype.sliceIterator__I__I__sc_Iterator = (function(from, until) {
  return (((this.sc_Iterator$$anon$20__f_consumed || (from > 0)) || (until === 0)) ? $m_sc_Iterator$().sc_Iterator$__f__empty : this);
});
var $d_sc_Iterator$$anon$20 = new $TypeData().initClass($c_sc_Iterator$$anon$20, "scala.collection.Iterator$$anon$20", ({
  sc_Iterator$$anon$20: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sc_Iterator$$anon$9(f$9, outer) {
  this.sc_Iterator$$anon$9__f_f$2 = null;
  this.sc_Iterator$$anon$9__f_$outer = null;
  this.sc_Iterator$$anon$9__f_f$2 = f$9;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  this.sc_Iterator$$anon$9__f_$outer = outer;
}
$c_sc_Iterator$$anon$9.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$9.prototype.constructor = $c_sc_Iterator$$anon$9;
/** @constructor */
function $h_sc_Iterator$$anon$9() {
}
$h_sc_Iterator$$anon$9.prototype = $c_sc_Iterator$$anon$9.prototype;
$c_sc_Iterator$$anon$9.prototype.knownSize__I = (function() {
  return $n(this.sc_Iterator$$anon$9__f_$outer).knownSize__I();
});
$c_sc_Iterator$$anon$9.prototype.hasNext__Z = (function() {
  return $n(this.sc_Iterator$$anon$9__f_$outer).hasNext__Z();
});
$c_sc_Iterator$$anon$9.prototype.next__O = (function() {
  return $n(this.sc_Iterator$$anon$9__f_f$2).apply__O__O($n(this.sc_Iterator$$anon$9__f_$outer).next__O());
});
var $d_sc_Iterator$$anon$9 = new $TypeData().initClass($c_sc_Iterator$$anon$9, "scala.collection.Iterator$$anon$9", ({
  sc_Iterator$$anon$9: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
function $p_sc_Iterator$ConcatIterator__merge$1__V($thiz) {
  while (true) {
    if (($thiz.sc_Iterator$ConcatIterator__f_current instanceof $c_sc_Iterator$ConcatIterator)) {
      var c = $as_sc_Iterator$ConcatIterator($thiz.sc_Iterator$ConcatIterator__f_current);
      $thiz.sc_Iterator$ConcatIterator__f_current = $n(c).sc_Iterator$ConcatIterator__f_current;
      $thiz.sc_Iterator$ConcatIterator__f_currentHasNextChecked = $n(c).sc_Iterator$ConcatIterator__f_currentHasNextChecked;
      if (($n(c).sc_Iterator$ConcatIterator__f_tail !== null)) {
        if (($thiz.sc_Iterator$ConcatIterator__f_last === null)) {
          $thiz.sc_Iterator$ConcatIterator__f_last = $n(c).sc_Iterator$ConcatIterator__f_last;
        }
        var x$proxy10 = $n(c).sc_Iterator$ConcatIterator__f_last;
        if ((x$proxy10 === null)) {
          $m_sr_Scala3RunTime$().nnFail__E();
        }
        $n(x$proxy10).sc_Iterator$ConcatIteratorCell__f_tail = $thiz.sc_Iterator$ConcatIterator__f_tail;
        $thiz.sc_Iterator$ConcatIterator__f_tail = $n(c).sc_Iterator$ConcatIterator__f_tail;
      }
    } else {
      return (void 0);
    }
  }
}
function $p_sc_Iterator$ConcatIterator__advance$1__Z($thiz) {
  while (true) {
    if (($thiz.sc_Iterator$ConcatIterator__f_tail === null)) {
      $thiz.sc_Iterator$ConcatIterator__f_current = null;
      $thiz.sc_Iterator$ConcatIterator__f_last = null;
      return false;
    } else {
      $thiz.sc_Iterator$ConcatIterator__f_current = $n($thiz.sc_Iterator$ConcatIterator__f_tail).headIterator__sc_Iterator();
      if (($thiz.sc_Iterator$ConcatIterator__f_last === $thiz.sc_Iterator$ConcatIterator__f_tail)) {
        var x$proxy12 = $thiz.sc_Iterator$ConcatIterator__f_last;
        if ((x$proxy12 === null)) {
          $m_sr_Scala3RunTime$().nnFail__E();
        }
        $thiz.sc_Iterator$ConcatIterator__f_last = $n(x$proxy12).sc_Iterator$ConcatIteratorCell__f_tail;
      }
      $thiz.sc_Iterator$ConcatIterator__f_tail = $n($thiz.sc_Iterator$ConcatIterator__f_tail).sc_Iterator$ConcatIteratorCell__f_tail;
      $p_sc_Iterator$ConcatIterator__merge$1__V($thiz);
      if ($thiz.sc_Iterator$ConcatIterator__f_currentHasNextChecked) {
        return true;
      } else {
        if ((!(($thiz.sc_Iterator$ConcatIterator__f_current !== null) && $n($thiz.sc_Iterator$ConcatIterator__f_current).hasNext__Z()))) {
          continue;
        }
        $thiz.sc_Iterator$ConcatIterator__f_currentHasNextChecked = true;
        return true;
      }
    }
  }
}
/** @constructor */
function $c_sc_Iterator$ConcatIterator(from) {
  this.sc_Iterator$ConcatIterator__f_current = null;
  this.sc_Iterator$ConcatIterator__f_tail = null;
  this.sc_Iterator$ConcatIterator__f_last = null;
  this.sc_Iterator$ConcatIterator__f_currentHasNextChecked = false;
  this.sc_Iterator$ConcatIterator__f_current = from;
  this.sc_Iterator$ConcatIterator__f_tail = null;
  this.sc_Iterator$ConcatIterator__f_last = null;
  this.sc_Iterator$ConcatIterator__f_currentHasNextChecked = false;
}
$c_sc_Iterator$ConcatIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$ConcatIterator.prototype.constructor = $c_sc_Iterator$ConcatIterator;
/** @constructor */
function $h_sc_Iterator$ConcatIterator() {
}
$h_sc_Iterator$ConcatIterator.prototype = $c_sc_Iterator$ConcatIterator.prototype;
$c_sc_Iterator$ConcatIterator.prototype.hasNext__Z = (function() {
  if (this.sc_Iterator$ConcatIterator__f_currentHasNextChecked) {
    return true;
  } else if ((this.sc_Iterator$ConcatIterator__f_current !== null)) {
    if ($n(this.sc_Iterator$ConcatIterator__f_current).hasNext__Z()) {
      this.sc_Iterator$ConcatIterator__f_currentHasNextChecked = true;
      return true;
    } else {
      return $p_sc_Iterator$ConcatIterator__advance$1__Z(this);
    }
  } else {
    return false;
  }
});
$c_sc_Iterator$ConcatIterator.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.sc_Iterator$ConcatIterator__f_currentHasNextChecked = false;
    var x$proxy13 = this.sc_Iterator$ConcatIterator__f_current;
    if ((x$proxy13 === null)) {
      $m_sr_Scala3RunTime$().nnFail__E();
    }
    return $n(x$proxy13).next__O();
  } else {
    return $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
});
$c_sc_Iterator$ConcatIterator.prototype.concat__F0__sc_Iterator = (function(that) {
  var c = new $c_sc_Iterator$ConcatIteratorCell(that, null);
  if ((this.sc_Iterator$ConcatIterator__f_tail === null)) {
    this.sc_Iterator$ConcatIterator__f_tail = c;
    this.sc_Iterator$ConcatIterator__f_last = c;
  } else {
    var x$proxy14 = this.sc_Iterator$ConcatIterator__f_last;
    if ((x$proxy14 === null)) {
      $m_sr_Scala3RunTime$().nnFail__E();
    }
    $n(x$proxy14).sc_Iterator$ConcatIteratorCell__f_tail = c;
    this.sc_Iterator$ConcatIterator__f_last = c;
  }
  if ((this.sc_Iterator$ConcatIterator__f_current === null)) {
    this.sc_Iterator$ConcatIterator__f_current = $m_sc_Iterator$().sc_Iterator$__f__empty;
  }
  return this;
});
function $as_sc_Iterator$ConcatIterator(obj) {
  return (((obj instanceof $c_sc_Iterator$ConcatIterator) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Iterator$ConcatIterator"));
}
function $isArrayOf_sc_Iterator$ConcatIterator(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Iterator$ConcatIterator)));
}
function $asArrayOf_sc_Iterator$ConcatIterator(obj, depth) {
  return (($isArrayOf_sc_Iterator$ConcatIterator(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Iterator$ConcatIterator;", depth));
}
var $d_sc_Iterator$ConcatIterator = new $TypeData().initClass($c_sc_Iterator$ConcatIterator, "scala.collection.Iterator$ConcatIterator", ({
  sc_Iterator$ConcatIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
function $p_sc_Iterator$SliceIterator__skip__V($thiz) {
  while (($thiz.sc_Iterator$SliceIterator__f_dropping > 0)) {
    if ($n($thiz.sc_Iterator$SliceIterator__f_underlying).hasNext__Z()) {
      $n($thiz.sc_Iterator$SliceIterator__f_underlying).next__O();
      $thiz.sc_Iterator$SliceIterator__f_dropping = (($thiz.sc_Iterator$SliceIterator__f_dropping - 1) | 0);
    } else {
      $thiz.sc_Iterator$SliceIterator__f_dropping = 0;
    }
  }
}
function $p_sc_Iterator$SliceIterator__adjustedBound$1__I__I($thiz, lo$1) {
  if (($thiz.sc_Iterator$SliceIterator__f_remaining < 0)) {
    return (-1);
  } else {
    var that = (($thiz.sc_Iterator$SliceIterator__f_remaining - lo$1) | 0);
    return ((that < 0) ? 0 : that);
  }
}
/** @constructor */
function $c_sc_Iterator$SliceIterator(underlying, start, limit) {
  this.sc_Iterator$SliceIterator__f_underlying = null;
  this.sc_Iterator$SliceIterator__f_remaining = 0;
  this.sc_Iterator$SliceIterator__f_dropping = 0;
  this.sc_Iterator$SliceIterator__f_underlying = underlying;
  this.sc_Iterator$SliceIterator__f_remaining = limit;
  this.sc_Iterator$SliceIterator__f_dropping = start;
}
$c_sc_Iterator$SliceIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$SliceIterator.prototype.constructor = $c_sc_Iterator$SliceIterator;
/** @constructor */
function $h_sc_Iterator$SliceIterator() {
}
$h_sc_Iterator$SliceIterator.prototype = $c_sc_Iterator$SliceIterator.prototype;
$c_sc_Iterator$SliceIterator.prototype.knownSize__I = (function() {
  var size = $n(this.sc_Iterator$SliceIterator__f_underlying).knownSize__I();
  if ((size < 0)) {
    return (-1);
  } else {
    var that = ((size - this.sc_Iterator$SliceIterator__f_dropping) | 0);
    var dropSize = ((that < 0) ? 0 : that);
    if ((this.sc_Iterator$SliceIterator__f_remaining < 0)) {
      return dropSize;
    } else {
      var x = this.sc_Iterator$SliceIterator__f_remaining;
      return ((x < dropSize) ? x : dropSize);
    }
  }
});
$c_sc_Iterator$SliceIterator.prototype.hasNext__Z = (function() {
  $p_sc_Iterator$SliceIterator__skip__V(this);
  return ((this.sc_Iterator$SliceIterator__f_remaining !== 0) && $n(this.sc_Iterator$SliceIterator__f_underlying).hasNext__Z());
});
$c_sc_Iterator$SliceIterator.prototype.next__O = (function() {
  $p_sc_Iterator$SliceIterator__skip__V(this);
  if ((this.sc_Iterator$SliceIterator__f_remaining > 0)) {
    this.sc_Iterator$SliceIterator__f_remaining = ((this.sc_Iterator$SliceIterator__f_remaining - 1) | 0);
    return $n(this.sc_Iterator$SliceIterator__f_underlying).next__O();
  } else {
    return ((this.sc_Iterator$SliceIterator__f_remaining < 0) ? $n(this.sc_Iterator$SliceIterator__f_underlying).next__O() : $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O());
  }
});
$c_sc_Iterator$SliceIterator.prototype.sliceIterator__I__I__sc_Iterator = (function(from, until) {
  var lo = ((from > 0) ? from : 0);
  if ((until < 0)) {
    var rest = $p_sc_Iterator$SliceIterator__adjustedBound$1__I__I(this, lo);
  } else if ((until <= lo)) {
    var rest = 0;
  } else if ((this.sc_Iterator$SliceIterator__f_remaining < 0)) {
    var rest = ((until - lo) | 0);
  } else {
    var x = $p_sc_Iterator$SliceIterator__adjustedBound$1__I__I(this, lo);
    var that = ((until - lo) | 0);
    var rest = ((x < that) ? x : that);
  }
  var sum = ((this.sc_Iterator$SliceIterator__f_dropping + lo) | 0);
  if ((rest === 0)) {
    return $m_sc_Iterator$().sc_Iterator$__f__empty;
  } else if ((sum < 0)) {
    this.sc_Iterator$SliceIterator__f_dropping = 2147483647;
    this.sc_Iterator$SliceIterator__f_remaining = 0;
    var xs = new $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c((() => new $c_sc_Iterator$SliceIterator(this.sc_Iterator$SliceIterator__f_underlying, ((sum - 2147483647) | 0), rest)));
    return $f_sc_Iterator__concat__F0__sc_Iterator(this, xs);
  } else {
    this.sc_Iterator$SliceIterator__f_dropping = sum;
    this.sc_Iterator$SliceIterator__f_remaining = rest;
    return this;
  }
});
var $d_sc_Iterator$SliceIterator = new $TypeData().initClass($c_sc_Iterator$SliceIterator, "scala.collection.Iterator$SliceIterator", ({
  sc_Iterator$SliceIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
function $f_sc_LinearSeqOps__apply__I__O($thiz, n) {
  if ((n < 0)) {
    throw $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), ("" + n));
  }
  var skipped = $as_sc_LinearSeq($thiz.drop__I__O(n));
  if ($n(skipped).isEmpty__Z()) {
    throw $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), ("" + n));
  }
  return $n(skipped).head__O();
}
function $f_sc_LinearSeqOps__sameElements__sc_IterableOnce__Z($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    var that$2 = $as_sc_LinearSeq(that);
    return $p_sc_LinearSeqOps__linearSeqEq$1__sc_LinearSeq__sc_LinearSeq__Z($thiz, $as_sc_LinearSeq($thiz), that$2);
  } else {
    return $f_sc_SeqOps__sameElements__sc_IterableOnce__Z($thiz, that);
  }
}
function $p_sc_LinearSeqOps__linearSeqEq$1__sc_LinearSeq__sc_LinearSeq__Z($thiz, a, b) {
  var b$tailLocal1 = b;
  var a$tailLocal1 = a;
  while (true) {
    if ((a$tailLocal1 === b$tailLocal1)) {
      return true;
    } else {
      var this$1 = $n(a$tailLocal1);
      if ((!this$1.isEmpty__Z())) {
        var this$2 = $n(b$tailLocal1);
        var $x_2 = (!this$2.isEmpty__Z());
      } else {
        var $x_2 = false;
      }
      if ($x_2) {
        var x = $n(a$tailLocal1).head__O();
        var y = $n(b$tailLocal1).head__O();
        var $x_1 = $m_sr_BoxesRunTime$().equals__O__O__Z(x, y);
      } else {
        var $x_1 = false;
      }
      if ($x_1) {
        var a$tailLocal1$tmp1 = $as_sc_LinearSeq($n(a$tailLocal1).tail__O());
        var b$tailLocal1$tmp1 = $as_sc_LinearSeq($n(b$tailLocal1).tail__O());
        a$tailLocal1 = a$tailLocal1$tmp1;
        b$tailLocal1 = b$tailLocal1$tmp1;
        continue;
      }
      return ($n(a$tailLocal1).isEmpty__Z() && $n(b$tailLocal1).isEmpty__Z());
    }
  }
}
/** @constructor */
function $c_sc_StrictOptimizedLinearSeqOps$$anon$1(outer) {
  this.sc_StrictOptimizedLinearSeqOps$$anon$1__f_current = null;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  this.sc_StrictOptimizedLinearSeqOps$$anon$1__f_current = outer;
}
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.constructor = $c_sc_StrictOptimizedLinearSeqOps$$anon$1;
/** @constructor */
function $h_sc_StrictOptimizedLinearSeqOps$$anon$1() {
}
$h_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype = $c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype;
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.hasNext__Z = (function() {
  return (!$n(this.sc_StrictOptimizedLinearSeqOps$$anon$1__f_current).isEmpty__Z());
});
$c_sc_StrictOptimizedLinearSeqOps$$anon$1.prototype.next__O = (function() {
  var r = $n(this.sc_StrictOptimizedLinearSeqOps$$anon$1__f_current).head__O();
  this.sc_StrictOptimizedLinearSeqOps$$anon$1__f_current = $as_sc_StrictOptimizedLinearSeqOps($n(this.sc_StrictOptimizedLinearSeqOps$$anon$1__f_current).tail__O());
  return r;
});
var $d_sc_StrictOptimizedLinearSeqOps$$anon$1 = new $TypeData().initClass($c_sc_StrictOptimizedLinearSeqOps$$anon$1, "scala.collection.StrictOptimizedLinearSeqOps$$anon$1", ({
  sc_StrictOptimizedLinearSeqOps$$anon$1: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
function $ct_sci_ChampBaseIterator__($thiz) {
  $thiz.sci_ChampBaseIterator__f_currentValueCursor = 0;
  $thiz.sci_ChampBaseIterator__f_currentValueLength = 0;
  $thiz.sci_ChampBaseIterator__f_currentStackLevel = (-1);
  return $thiz;
}
function $p_sci_ChampBaseIterator__initNodes__V($thiz) {
  if (($thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths === null)) {
    $thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths = new $ac_I(($m_sci_Node$().sci_Node$__f_MaxDepth << 1));
    $thiz.sci_ChampBaseIterator__f_nodes = new ($d_sci_Node.getArrayOf().constr)($m_sci_Node$().sci_Node$__f_MaxDepth);
  }
}
function $ct_sci_ChampBaseIterator__sci_Node__($thiz, rootNode) {
  $ct_sci_ChampBaseIterator__($thiz);
  if ($n(rootNode).hasNodes__Z()) {
    $p_sci_ChampBaseIterator__pushNode__sci_Node__V($thiz, rootNode);
  }
  if ($n(rootNode).hasPayload__Z()) {
    $p_sci_ChampBaseIterator__setupPayloadNode__sci_Node__V($thiz, rootNode);
  }
  return $thiz;
}
function $p_sci_ChampBaseIterator__setupPayloadNode__sci_Node__V($thiz, node) {
  $thiz.sci_ChampBaseIterator__f_currentValueNode = node;
  $thiz.sci_ChampBaseIterator__f_currentValueCursor = 0;
  $thiz.sci_ChampBaseIterator__f_currentValueLength = $n(node).payloadArity__I();
}
function $p_sci_ChampBaseIterator__pushNode__sci_Node__V($thiz, node) {
  $p_sci_ChampBaseIterator__initNodes__V($thiz);
  $thiz.sci_ChampBaseIterator__f_currentStackLevel = ((1 + $thiz.sci_ChampBaseIterator__f_currentStackLevel) | 0);
  var cursorIndex = ($thiz.sci_ChampBaseIterator__f_currentStackLevel << 1);
  var lengthIndex = ((1 + ($thiz.sci_ChampBaseIterator__f_currentStackLevel << 1)) | 0);
  $n($thiz.sci_ChampBaseIterator__f_nodes).set($thiz.sci_ChampBaseIterator__f_currentStackLevel, node);
  $n($thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths).set(cursorIndex, 0);
  $n($thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths).set(lengthIndex, $n(node).nodeArity__I());
}
function $p_sci_ChampBaseIterator__popNode__V($thiz) {
  $thiz.sci_ChampBaseIterator__f_currentStackLevel = (($thiz.sci_ChampBaseIterator__f_currentStackLevel - 1) | 0);
}
function $p_sci_ChampBaseIterator__searchNextValueNode__Z($thiz) {
  while (($thiz.sci_ChampBaseIterator__f_currentStackLevel >= 0)) {
    var cursorIndex = ($thiz.sci_ChampBaseIterator__f_currentStackLevel << 1);
    var lengthIndex = ((1 + ($thiz.sci_ChampBaseIterator__f_currentStackLevel << 1)) | 0);
    var nodeCursor = $n($thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths).get(cursorIndex);
    var nodeLength = $n($thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths).get(lengthIndex);
    if ((nodeCursor < nodeLength)) {
      var \u03b41$ = $thiz.sci_ChampBaseIterator__f_nodeCursorsAndLengths;
      $n(\u03b41$).set(cursorIndex, ((1 + $n(\u03b41$).get(cursorIndex)) | 0));
      var nextNode = $n($n($thiz.sci_ChampBaseIterator__f_nodes).get($thiz.sci_ChampBaseIterator__f_currentStackLevel)).getNode__I__sci_Node(nodeCursor);
      if ($n(nextNode).hasNodes__Z()) {
        $p_sci_ChampBaseIterator__pushNode__sci_Node__V($thiz, nextNode);
      }
      if ($n(nextNode).hasPayload__Z()) {
        $p_sci_ChampBaseIterator__setupPayloadNode__sci_Node__V($thiz, nextNode);
        return true;
      }
    } else {
      $p_sci_ChampBaseIterator__popNode__V($thiz);
    }
  }
  return false;
}
/** @constructor */
function $c_sci_ChampBaseIterator() {
  this.sci_ChampBaseIterator__f_currentValueCursor = 0;
  this.sci_ChampBaseIterator__f_currentValueLength = 0;
  this.sci_ChampBaseIterator__f_currentValueNode = null;
  this.sci_ChampBaseIterator__f_currentStackLevel = 0;
  this.sci_ChampBaseIterator__f_nodeCursorsAndLengths = null;
  this.sci_ChampBaseIterator__f_nodes = null;
}
$c_sci_ChampBaseIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_ChampBaseIterator.prototype.constructor = $c_sci_ChampBaseIterator;
/** @constructor */
function $h_sci_ChampBaseIterator() {
}
$h_sci_ChampBaseIterator.prototype = $c_sci_ChampBaseIterator.prototype;
$c_sci_ChampBaseIterator.prototype.hasNext__Z = (function() {
  return ((this.sci_ChampBaseIterator__f_currentValueCursor < this.sci_ChampBaseIterator__f_currentValueLength) || $p_sci_ChampBaseIterator__searchNextValueNode__Z(this));
});
function $ct_sci_ChampBaseReverseIterator__($thiz) {
  $thiz.sci_ChampBaseReverseIterator__f_currentValueCursor = (-1);
  $thiz.sci_ChampBaseReverseIterator__f_currentStackLevel = (-1);
  $thiz.sci_ChampBaseReverseIterator__f_nodeIndex = new $ac_I(((1 + $m_sci_Node$().sci_Node$__f_MaxDepth) | 0));
  $thiz.sci_ChampBaseReverseIterator__f_nodeStack = new ($d_sci_Node.getArrayOf().constr)(((1 + $m_sci_Node$().sci_Node$__f_MaxDepth) | 0));
  return $thiz;
}
function $ct_sci_ChampBaseReverseIterator__sci_Node__($thiz, rootNode) {
  $ct_sci_ChampBaseReverseIterator__($thiz);
  $p_sci_ChampBaseReverseIterator__pushNode__sci_Node__V($thiz, rootNode);
  $p_sci_ChampBaseReverseIterator__searchNextValueNode__Z($thiz);
  return $thiz;
}
function $p_sci_ChampBaseReverseIterator__setupPayloadNode__sci_Node__V($thiz, node) {
  $thiz.sci_ChampBaseReverseIterator__f_currentValueNode = node;
  $thiz.sci_ChampBaseReverseIterator__f_currentValueCursor = (($n(node).payloadArity__I() - 1) | 0);
}
function $p_sci_ChampBaseReverseIterator__pushNode__sci_Node__V($thiz, node) {
  $thiz.sci_ChampBaseReverseIterator__f_currentStackLevel = ((1 + $thiz.sci_ChampBaseReverseIterator__f_currentStackLevel) | 0);
  $n($thiz.sci_ChampBaseReverseIterator__f_nodeStack).set($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel, node);
  $n($thiz.sci_ChampBaseReverseIterator__f_nodeIndex).set($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel, (($n(node).nodeArity__I() - 1) | 0));
}
function $p_sci_ChampBaseReverseIterator__popNode__V($thiz) {
  $thiz.sci_ChampBaseReverseIterator__f_currentStackLevel = (($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel - 1) | 0);
}
function $p_sci_ChampBaseReverseIterator__searchNextValueNode__Z($thiz) {
  while (($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel >= 0)) {
    var nodeCursor = $n($thiz.sci_ChampBaseReverseIterator__f_nodeIndex).get($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel);
    $n($thiz.sci_ChampBaseReverseIterator__f_nodeIndex).set($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel, ((nodeCursor - 1) | 0));
    if ((nodeCursor >= 0)) {
      var nextNode = $n($n($thiz.sci_ChampBaseReverseIterator__f_nodeStack).get($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel)).getNode__I__sci_Node(nodeCursor);
      $p_sci_ChampBaseReverseIterator__pushNode__sci_Node__V($thiz, nextNode);
    } else {
      var currNode = $n($thiz.sci_ChampBaseReverseIterator__f_nodeStack).get($thiz.sci_ChampBaseReverseIterator__f_currentStackLevel);
      $p_sci_ChampBaseReverseIterator__popNode__V($thiz);
      if ($n(currNode).hasPayload__Z()) {
        $p_sci_ChampBaseReverseIterator__setupPayloadNode__sci_Node__V($thiz, currNode);
        return true;
      }
    }
  }
  return false;
}
/** @constructor */
function $c_sci_ChampBaseReverseIterator() {
  this.sci_ChampBaseReverseIterator__f_currentValueCursor = 0;
  this.sci_ChampBaseReverseIterator__f_currentValueNode = null;
  this.sci_ChampBaseReverseIterator__f_currentStackLevel = 0;
  this.sci_ChampBaseReverseIterator__f_nodeIndex = null;
  this.sci_ChampBaseReverseIterator__f_nodeStack = null;
}
$c_sci_ChampBaseReverseIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_ChampBaseReverseIterator.prototype.constructor = $c_sci_ChampBaseReverseIterator;
/** @constructor */
function $h_sci_ChampBaseReverseIterator() {
}
$h_sci_ChampBaseReverseIterator.prototype = $c_sci_ChampBaseReverseIterator.prototype;
$c_sci_ChampBaseReverseIterator.prototype.hasNext__Z = (function() {
  return ((this.sci_ChampBaseReverseIterator__f_currentValueCursor >= 0) || $p_sci_ChampBaseReverseIterator__searchNextValueNode__Z(this));
});
function $p_sci_HashMapBuilder__isAliased__Z($thiz) {
  return ($thiz.sci_HashMapBuilder__f_aliased !== null);
}
function $p_sci_HashMapBuilder__insertElement__AI__I__I__AI($thiz, as, ix, elem) {
  if ((ix < 0)) {
    throw $ct_jl_ArrayIndexOutOfBoundsException__(new $c_jl_ArrayIndexOutOfBoundsException());
  }
  if ((ix > $n(as).u.length)) {
    throw $ct_jl_ArrayIndexOutOfBoundsException__(new $c_jl_ArrayIndexOutOfBoundsException());
  }
  var result = new $ac_I(((1 + $n(as).u.length) | 0));
  $systemArraycopy($n(as), 0, result, 0, ix);
  result.set(ix, elem);
  var destPos = ((1 + ix) | 0);
  var length = (($n(as).u.length - ix) | 0);
  $systemArraycopy($n(as), ix, result, destPos, length);
  return result;
}
function $p_sci_HashMapBuilder__insertValue__sci_BitmapIndexedMapNode__I__O__I__I__O__V($thiz, bm, bitpos, key, originalHash, keyHash, value) {
  var dataIx = $n(bm).dataIndex__I__I(bitpos);
  var idx = (dataIx << 1);
  var src = $n(bm).sci_BitmapIndexedMapNode__f_content;
  var dst = new $ac_O(((2 + $n(src).u.length) | 0));
  $systemArraycopyRefs($n(src), 0, dst, 0, idx);
  dst.set(idx, key);
  dst.set(((1 + idx) | 0), value);
  var destPos = ((2 + idx) | 0);
  var length = (($n(src).u.length - idx) | 0);
  $systemArraycopyRefs($n(src), idx, dst, destPos, length);
  var dstHashes = $p_sci_HashMapBuilder__insertElement__AI__I__I__AI($thiz, $n(bm).sci_BitmapIndexedMapNode__f_originalHashes, dataIx, originalHash);
  $n(bm).sci_BitmapIndexedMapNode__f_dataMap = ($n(bm).sci_BitmapIndexedMapNode__f_dataMap | bitpos);
  $n(bm).sci_BitmapIndexedMapNode__f_content = dst;
  $n(bm).sci_BitmapIndexedMapNode__f_originalHashes = dstHashes;
  $n(bm).sci_BitmapIndexedMapNode__f_size = ((1 + $n(bm).sci_BitmapIndexedMapNode__f_size) | 0);
  $n(bm).sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode = (($n(bm).sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode + keyHash) | 0);
}
function $p_sci_HashMapBuilder__ensureUnaliased__V($thiz) {
  if ($p_sci_HashMapBuilder__isAliased__Z($thiz)) {
    $p_sci_HashMapBuilder__copyElems__V($thiz);
  }
  $thiz.sci_HashMapBuilder__f_aliased = null;
}
function $p_sci_HashMapBuilder__copyElems__V($thiz) {
  $thiz.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode = $n($thiz.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode).copy__sci_BitmapIndexedMapNode();
}
/** @constructor */
function $c_sci_HashMapBuilder() {
  this.sci_HashMapBuilder__f_aliased = null;
  this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode = null;
  this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode = new $c_sci_BitmapIndexedMapNode(0, 0, $m_s_Array$EmptyArrays$().s_Array$EmptyArrays$__f_emptyObjectArray, $m_s_Array$EmptyArrays$().s_Array$EmptyArrays$__f_emptyIntArray, 0, 0);
}
$c_sci_HashMapBuilder.prototype = new $h_O();
$c_sci_HashMapBuilder.prototype.constructor = $c_sci_HashMapBuilder;
/** @constructor */
function $h_sci_HashMapBuilder() {
}
$h_sci_HashMapBuilder.prototype = $c_sci_HashMapBuilder.prototype;
$c_sci_HashMapBuilder.prototype.update__sci_MapNode__O__O__I__I__I__V = (function(mapNode, key, value, originalHash, keyHash, shift) {
  if ((mapNode instanceof $c_sci_BitmapIndexedMapNode)) {
    var bm = $as_sci_BitmapIndexedMapNode(mapNode);
    var mask = $m_sci_Node$().maskFrom__I__I__I(keyHash, shift);
    var bitpos = $m_sci_Node$().bitposFrom__I__I(mask);
    if ((($n(bm).sci_BitmapIndexedMapNode__f_dataMap & bitpos) !== 0)) {
      var index = $m_sci_Node$().indexFrom__I__I__I__I($n(bm).sci_BitmapIndexedMapNode__f_dataMap, mask, bitpos);
      var key0 = $n(bm).getKey__I__O(index);
      var key0UnimprovedHash = $n(bm).getHash__I__I(index);
      if (((key0UnimprovedHash === originalHash) && $m_sr_BoxesRunTime$().equals__O__O__Z(key0, key))) {
        $n($n(bm).sci_BitmapIndexedMapNode__f_content).set(((1 + (index << 1)) | 0), value);
        return (void 0);
      } else {
        var value0 = $n(bm).getValue__I__O(index);
        var key0Hash = $m_sc_Hashing$().improve__I__I(key0UnimprovedHash);
        var subNodeNew = $n(bm).mergeTwoKeyValPairs__O__O__I__I__O__O__I__I__I__sci_MapNode(key0, value0, key0UnimprovedHash, key0Hash, key, value, originalHash, keyHash, ((5 + shift) | 0));
        $n(bm).migrateFromInlineToNodeInPlace__I__I__sci_MapNode__sci_BitmapIndexedMapNode(bitpos, key0Hash, subNodeNew);
        return (void 0);
      }
    } else if ((($n(bm).sci_BitmapIndexedMapNode__f_nodeMap & bitpos) !== 0)) {
      var index$2 = $m_sci_Node$().indexFrom__I__I__I__I($n(bm).sci_BitmapIndexedMapNode__f_nodeMap, mask, bitpos);
      var subNode = $n(bm).getNode__I__sci_MapNode(index$2);
      var beforeSize = $n(subNode).size__I();
      var beforeHash = $n(subNode).cachedJavaKeySetHashCode__I();
      this.update__sci_MapNode__O__O__I__I__I__V(subNode, key, value, originalHash, keyHash, ((5 + shift) | 0));
      $n(bm).sci_BitmapIndexedMapNode__f_size = (($n(bm).sci_BitmapIndexedMapNode__f_size + (($n(subNode).size__I() - beforeSize) | 0)) | 0);
      $n(bm).sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode = (($n(bm).sci_BitmapIndexedMapNode__f_cachedJavaKeySetHashCode + (($n(subNode).cachedJavaKeySetHashCode__I() - beforeHash) | 0)) | 0);
      return (void 0);
    } else {
      $p_sci_HashMapBuilder__insertValue__sci_BitmapIndexedMapNode__I__O__I__I__O__V(this, bm, bitpos, key, originalHash, keyHash, value);
      return (void 0);
    }
  }
  if ((mapNode instanceof $c_sci_HashCollisionMapNode)) {
    var hc = $as_sci_HashCollisionMapNode(mapNode);
    var index$3 = $n(hc).indexOf__O__I(key);
    if ((index$3 < 0)) {
      $n(hc).sci_HashCollisionMapNode__f_content = $n($n(hc).sci_HashCollisionMapNode__f_content).appended__O__sci_Vector(new $c_T2(key, value));
      return (void 0);
    } else {
      $n(hc).sci_HashCollisionMapNode__f_content = $n($n(hc).sci_HashCollisionMapNode__f_content).updated__I__O__sci_Vector(index$3, new $c_T2(key, value));
      return (void 0);
    }
  }
  throw new $c_s_MatchError(mapNode);
});
$c_sci_HashMapBuilder.prototype.result__sci_HashMap = (function() {
  if (($n(this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode).sci_BitmapIndexedMapNode__f_size === 0)) {
    return $m_sci_HashMap$().sci_HashMap$__f_EmptyMap;
  } else if ((this.sci_HashMapBuilder__f_aliased !== null)) {
    return this.sci_HashMapBuilder__f_aliased;
  } else {
    this.sci_HashMapBuilder__f_aliased = new $c_sci_HashMap(this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode);
    return this.sci_HashMapBuilder__f_aliased;
  }
});
$c_sci_HashMapBuilder.prototype.addOne__T2__sci_HashMapBuilder = (function(elem) {
  $p_sci_HashMapBuilder__ensureUnaliased__V(this);
  var x = $n(elem)._1__O();
  var h = $m_sr_Statics$().anyHash__O__I(x);
  var im = $m_sc_Hashing$().improve__I__I(h);
  this.update__sci_MapNode__O__O__I__I__I__V(this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode, $n(elem)._1__O(), $n(elem)._2__O(), h, im, 0);
  return this;
});
$c_sci_HashMapBuilder.prototype.addOne__O__O__sci_HashMapBuilder = (function(key, value) {
  $p_sci_HashMapBuilder__ensureUnaliased__V(this);
  var originalHash = $m_sr_Statics$().anyHash__O__I(key);
  this.update__sci_MapNode__O__O__I__I__I__V(this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode, key, value, originalHash, $m_sc_Hashing$().improve__I__I(originalHash), 0);
  return this;
});
$c_sci_HashMapBuilder.prototype.addAll__sc_IterableOnce__sci_HashMapBuilder = (function(xs) {
  $p_sci_HashMapBuilder__ensureUnaliased__V(this);
  if ((xs instanceof $c_sci_HashMap)) {
    var hm = $as_sci_HashMap(xs);
    new $c_sci_HashMapBuilder$$anon$1(hm, this);
  } else if (false) {
    var hm$2 = $as_scm_HashMap(xs);
    var iter = $n(hm$2).nodeIterator__sc_Iterator();
    while ($n(iter).hasNext__Z()) {
      var next = $as_scm_HashMap$Node($n(iter).next__O());
      var originalHash = $n(hm$2).unimproveHash__I__I($n(next).hash__I());
      var hash = $m_sc_Hashing$().improve__I__I(originalHash);
      this.update__sci_MapNode__O__O__I__I__I__V(this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode, $n(next).key__O(), $n(next).value__O(), originalHash, hash, 0);
    }
  } else if (false) {
    var lhm = $as_scm_LinkedHashMap(xs);
    var iter$2 = $n(lhm).entryIterator__sc_Iterator();
    while ($n(iter$2).hasNext__Z()) {
      var next$2 = $as_scm_LinkedHashMap$LinkedEntry($n(iter$2).next__O());
      var originalHash$2 = $n(lhm).unimproveHash__I__I($n(next$2).hash__I());
      var hash$2 = $m_sc_Hashing$().improve__I__I(originalHash$2);
      this.update__sci_MapNode__O__O__I__I__I__V(this.sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode, $n(next$2).key__O(), $n(next$2).value__O(), originalHash$2, hash$2, 0);
    }
  } else if ($is_sci_Map(xs)) {
    var thatMap = $as_sci_Map(xs);
    $n(thatMap).foreachEntry__F2__V(new $c_sr_AbstractFunction2_$$Lambda$b4228bd32034ae3b2f0c5fc896319aa4b79b55f8(((key$2, value$2) => this.addOne__O__O__sci_HashMapBuilder(key$2, value$2))));
  } else {
    var it = $n(xs).iterator__sc_Iterator();
    while ($n(it).hasNext__Z()) {
      this.addOne__T2__sci_HashMapBuilder($as_T2($n(it).next__O()));
    }
  }
  return this;
});
$c_sci_HashMapBuilder.prototype.result__O = (function() {
  return this.result__sci_HashMap();
});
$c_sci_HashMapBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__T2__sci_HashMapBuilder($as_T2(elem));
});
$c_sci_HashMapBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(elems) {
  return this.addAll__sc_IterableOnce__sci_HashMapBuilder(elems);
});
var $d_sci_HashMapBuilder = new $TypeData().initClass($c_sci_HashMapBuilder, "scala.collection.immutable.HashMapBuilder", ({
  sci_HashMapBuilder: 1,
  scm_Clearable: 1,
  scm_Growable: 1,
  scm_Builder: 1,
  scm_ReusableBuilder: 1
}));
/** @constructor */
function $c_sci_List$() {
  $n_sci_List$ = this;
  var _1 = $m_sci_Nil$();
  $m_sci_Nil$();
}
$c_sci_List$.prototype = new $h_O();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.from__sc_IterableOnce__O = (function(source) {
  return $m_sci_Nil$().prependedAll__sc_IterableOnce__sci_List(source);
});
var $d_sci_List$ = new $TypeData().initClass($c_sci_List$, "scala.collection.immutable.List$", ({
  sci_List$: 1,
  Ljava_io_Serializable: 1,
  sc_IterableFactory: 1,
  sc_SeqFactory: 1,
  sc_StrictOptimizedSeqFactory: 1
}));
var $n_sci_List$;
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$();
  }
  return $n_sci_List$;
}
function $ct_sci_Map$Map2$Map2Iterator__sci_Map$Map2__($thiz, outer) {
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $thiz.sci_Map$Map2$Map2Iterator__f_$outer = outer;
  $thiz.sci_Map$Map2$Map2Iterator__f_i = 0;
  return $thiz;
}
/** @constructor */
function $c_sci_Map$Map2$Map2Iterator() {
  this.sci_Map$Map2$Map2Iterator__f_i = 0;
  this.sci_Map$Map2$Map2Iterator__f_$outer = null;
}
$c_sci_Map$Map2$Map2Iterator.prototype = new $h_sc_AbstractIterator();
$c_sci_Map$Map2$Map2Iterator.prototype.constructor = $c_sci_Map$Map2$Map2Iterator;
/** @constructor */
function $h_sci_Map$Map2$Map2Iterator() {
}
$h_sci_Map$Map2$Map2Iterator.prototype = $c_sci_Map$Map2$Map2Iterator.prototype;
$c_sci_Map$Map2$Map2Iterator.prototype.hasNext__Z = (function() {
  return (this.sci_Map$Map2$Map2Iterator__f_i < 2);
});
$c_sci_Map$Map2$Map2Iterator.prototype.next__O = (function() {
  matchResult5$1: {
    var result;
    var x23 = this.sci_Map$Map2$Map2Iterator__f_i;
    if ((x23 === 0)) {
      var k = $n(this.sci_Map$Map2$Map2Iterator__f_$outer).sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
      var v = $n(this.sci_Map$Map2$Map2Iterator__f_$outer).sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1;
      var result = new $c_T2(k, v);
      break matchResult5$1;
    }
    if ((x23 === 1)) {
      var k$1 = $n(this.sci_Map$Map2$Map2Iterator__f_$outer).sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
      var v$1 = $n(this.sci_Map$Map2$Map2Iterator__f_$outer).sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2;
      var result = new $c_T2(k$1, v$1);
      break matchResult5$1;
    }
    var result = $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
  this.sci_Map$Map2$Map2Iterator__f_i = ((1 + this.sci_Map$Map2$Map2Iterator__f_i) | 0);
  return result;
});
$c_sci_Map$Map2$Map2Iterator.prototype.drop__I__sc_Iterator = (function(n) {
  this.sci_Map$Map2$Map2Iterator__f_i = ((this.sci_Map$Map2$Map2Iterator__f_i + n) | 0);
  return this;
});
function $ct_sci_Map$Map3$Map3Iterator__sci_Map$Map3__($thiz, outer) {
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $thiz.sci_Map$Map3$Map3Iterator__f_$outer = outer;
  $thiz.sci_Map$Map3$Map3Iterator__f_i = 0;
  return $thiz;
}
/** @constructor */
function $c_sci_Map$Map3$Map3Iterator() {
  this.sci_Map$Map3$Map3Iterator__f_i = 0;
  this.sci_Map$Map3$Map3Iterator__f_$outer = null;
}
$c_sci_Map$Map3$Map3Iterator.prototype = new $h_sc_AbstractIterator();
$c_sci_Map$Map3$Map3Iterator.prototype.constructor = $c_sci_Map$Map3$Map3Iterator;
/** @constructor */
function $h_sci_Map$Map3$Map3Iterator() {
}
$h_sci_Map$Map3$Map3Iterator.prototype = $c_sci_Map$Map3$Map3Iterator.prototype;
$c_sci_Map$Map3$Map3Iterator.prototype.hasNext__Z = (function() {
  return (this.sci_Map$Map3$Map3Iterator__f_i < 3);
});
$c_sci_Map$Map3$Map3Iterator.prototype.next__O = (function() {
  var result;
  var x25 = this.sci_Map$Map3$Map3Iterator__f_i;
  switch (x25) {
    case 0: {
      var k = $n(this.sci_Map$Map3$Map3Iterator__f_$outer).sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
      var v = $n(this.sci_Map$Map3$Map3Iterator__f_$outer).sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1;
      var result = new $c_T2(k, v);
      break;
    }
    case 1: {
      var k$1 = $n(this.sci_Map$Map3$Map3Iterator__f_$outer).sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
      var v$1 = $n(this.sci_Map$Map3$Map3Iterator__f_$outer).sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2;
      var result = new $c_T2(k$1, v$1);
      break;
    }
    case 2: {
      var k$2 = $n(this.sci_Map$Map3$Map3Iterator__f_$outer).sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
      var v$2 = $n(this.sci_Map$Map3$Map3Iterator__f_$outer).sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3;
      var result = new $c_T2(k$2, v$2);
      break;
    }
    default: {
      var result = $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
    }
  }
  this.sci_Map$Map3$Map3Iterator__f_i = ((1 + this.sci_Map$Map3$Map3Iterator__f_i) | 0);
  return result;
});
$c_sci_Map$Map3$Map3Iterator.prototype.drop__I__sc_Iterator = (function(n) {
  this.sci_Map$Map3$Map3Iterator__f_i = ((this.sci_Map$Map3$Map3Iterator__f_i + n) | 0);
  return this;
});
function $ct_sci_Map$Map4$Map4Iterator__sci_Map$Map4__($thiz, outer) {
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $thiz.sci_Map$Map4$Map4Iterator__f_$outer = outer;
  $thiz.sci_Map$Map4$Map4Iterator__f_i = 0;
  return $thiz;
}
/** @constructor */
function $c_sci_Map$Map4$Map4Iterator() {
  this.sci_Map$Map4$Map4Iterator__f_i = 0;
  this.sci_Map$Map4$Map4Iterator__f_$outer = null;
}
$c_sci_Map$Map4$Map4Iterator.prototype = new $h_sc_AbstractIterator();
$c_sci_Map$Map4$Map4Iterator.prototype.constructor = $c_sci_Map$Map4$Map4Iterator;
/** @constructor */
function $h_sci_Map$Map4$Map4Iterator() {
}
$h_sci_Map$Map4$Map4Iterator.prototype = $c_sci_Map$Map4$Map4Iterator.prototype;
$c_sci_Map$Map4$Map4Iterator.prototype.hasNext__Z = (function() {
  return (this.sci_Map$Map4$Map4Iterator__f_i < 4);
});
$c_sci_Map$Map4$Map4Iterator.prototype.next__O = (function() {
  var result;
  var x27 = this.sci_Map$Map4$Map4Iterator__f_i;
  switch (x27) {
    case 0: {
      var k = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
      var v = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1;
      var result = new $c_T2(k, v);
      break;
    }
    case 1: {
      var k$1 = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
      var v$1 = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2;
      var result = new $c_T2(k$1, v$1);
      break;
    }
    case 2: {
      var k$2 = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
      var v$2 = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3;
      var result = new $c_T2(k$2, v$2);
      break;
    }
    case 3: {
      var k$3 = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
      var v$3 = $n(this.sci_Map$Map4$Map4Iterator__f_$outer).sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4;
      var result = new $c_T2(k$3, v$3);
      break;
    }
    default: {
      var result = $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
    }
  }
  this.sci_Map$Map4$Map4Iterator__f_i = ((1 + this.sci_Map$Map4$Map4Iterator__f_i) | 0);
  return result;
});
$c_sci_Map$Map4$Map4Iterator.prototype.drop__I__sc_Iterator = (function(n) {
  this.sci_Map$Map4$Map4Iterator__f_i = ((this.sci_Map$Map4$Map4Iterator__f_i + n) | 0);
  return this;
});
/** @constructor */
function $c_sci_MapBuilderImpl() {
  this.sci_MapBuilderImpl__f_elems = null;
  this.sci_MapBuilderImpl__f_switchedToHashMapBuilder = false;
  this.sci_MapBuilderImpl__f_hashMapBuilder = null;
  this.sci_MapBuilderImpl__f_elems = $m_sci_Map$EmptyMap$();
  this.sci_MapBuilderImpl__f_switchedToHashMapBuilder = false;
}
$c_sci_MapBuilderImpl.prototype = new $h_O();
$c_sci_MapBuilderImpl.prototype.constructor = $c_sci_MapBuilderImpl;
/** @constructor */
function $h_sci_MapBuilderImpl() {
}
$h_sci_MapBuilderImpl.prototype = $c_sci_MapBuilderImpl.prototype;
$c_sci_MapBuilderImpl.prototype.result__sci_Map = (function() {
  return (this.sci_MapBuilderImpl__f_switchedToHashMapBuilder ? $n(this.sci_MapBuilderImpl__f_hashMapBuilder).result__sci_HashMap() : this.sci_MapBuilderImpl__f_elems);
});
$c_sci_MapBuilderImpl.prototype.addOne__O__O__sci_MapBuilderImpl = (function(key, value) {
  if (this.sci_MapBuilderImpl__f_switchedToHashMapBuilder) {
    $n(this.sci_MapBuilderImpl__f_hashMapBuilder).addOne__O__O__sci_HashMapBuilder(key, value);
  } else if (($n(this.sci_MapBuilderImpl__f_elems).size__I() < 4)) {
    this.sci_MapBuilderImpl__f_elems = $as_sci_Map($n(this.sci_MapBuilderImpl__f_elems).updated__O__O__sci_MapOps(key, value));
  } else if ($n(this.sci_MapBuilderImpl__f_elems).contains__O__Z(key)) {
    this.sci_MapBuilderImpl__f_elems = $as_sci_Map($n(this.sci_MapBuilderImpl__f_elems).updated__O__O__sci_MapOps(key, value));
  } else {
    this.sci_MapBuilderImpl__f_switchedToHashMapBuilder = true;
    if ((this.sci_MapBuilderImpl__f_hashMapBuilder === null)) {
      this.sci_MapBuilderImpl__f_hashMapBuilder = new $c_sci_HashMapBuilder();
    }
    $n($as_sci_Map$Map4(this.sci_MapBuilderImpl__f_elems)).buildTo__sci_HashMapBuilder__sci_HashMapBuilder(this.sci_MapBuilderImpl__f_hashMapBuilder);
    $n(this.sci_MapBuilderImpl__f_hashMapBuilder).addOne__O__O__sci_HashMapBuilder(key, value);
  }
  return this;
});
$c_sci_MapBuilderImpl.prototype.addAll__sc_IterableOnce__sci_MapBuilderImpl = (function(xs) {
  return (this.sci_MapBuilderImpl__f_switchedToHashMapBuilder ? ($n(this.sci_MapBuilderImpl__f_hashMapBuilder).addAll__sc_IterableOnce__sci_HashMapBuilder(xs), this) : $as_sci_MapBuilderImpl($f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, xs)));
});
$c_sci_MapBuilderImpl.prototype.result__O = (function() {
  return this.result__sci_Map();
});
$c_sci_MapBuilderImpl.prototype.addOne__O__scm_Growable = (function(elem) {
  var elem$1 = $as_T2(elem);
  return this.addOne__O__O__sci_MapBuilderImpl($n(elem$1)._1__O(), $n(elem$1)._2__O());
});
$c_sci_MapBuilderImpl.prototype.addAll__sc_IterableOnce__scm_Growable = (function(elems) {
  return this.addAll__sc_IterableOnce__sci_MapBuilderImpl(elems);
});
function $as_sci_MapBuilderImpl(obj) {
  return (((obj instanceof $c_sci_MapBuilderImpl) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.MapBuilderImpl"));
}
function $isArrayOf_sci_MapBuilderImpl(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_MapBuilderImpl)));
}
function $asArrayOf_sci_MapBuilderImpl(obj, depth) {
  return (($isArrayOf_sci_MapBuilderImpl(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.MapBuilderImpl;", depth));
}
var $d_sci_MapBuilderImpl = new $TypeData().initClass($c_sci_MapBuilderImpl, "scala.collection.immutable.MapBuilderImpl", ({
  sci_MapBuilderImpl: 1,
  scm_Clearable: 1,
  scm_Growable: 1,
  scm_Builder: 1,
  scm_ReusableBuilder: 1
}));
/** @constructor */
function $c_sci_Vector$() {
  this.sci_Vector$__f_scala$collection$immutable$Vector$$$defaultApplyPreferredMaxLength = 0;
  this.sci_Vector$__f_scala$collection$immutable$Vector$$$emptyIterator = null;
  $n_sci_Vector$ = this;
  try {
    $m_sc_StringOps$();
    var this$ = $m_jl_System$SystemProperties$().getProperty__T__T__T("scala.collection.immutable.Vector.defaultApplyPreferredMaxLength", "250");
    var this$3 = $m_jl_Integer$();
    var $x_1 = this$3.java$lang$Integer$$parseIntImpl__T__I__I__I(this$, 10, 214748364);
  } catch (e) {
    if (false) {
      var $x_1 = 250;
    } else {
      var $x_1;
      throw e;
    }
  }
  this.sci_Vector$__f_scala$collection$immutable$Vector$$$defaultApplyPreferredMaxLength = $x_1;
  this.sci_Vector$__f_scala$collection$immutable$Vector$$$emptyIterator = new $c_sci_NewVectorIterator($m_sci_Vector0$(), 0, 0);
}
$c_sci_Vector$.prototype = new $h_O();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.from__sc_IterableOnce__sci_Vector = (function(it) {
  if ((it instanceof $c_sci_Vector)) {
    var v = $as_sci_Vector(it);
    return v;
  } else {
    var knownSize = $n(it).knownSize__I();
    if ((knownSize === 0)) {
      return $m_sci_Vector0$();
    } else if (((((knownSize - 1) | 0) >>> 0) <= 31)) {
      matchResult3: {
        var a1$3;
        if (false) {
          var as = $as_sci_ArraySeq$ofRef(it);
          var x = $n($n(as).elemTag__s_reflect_ClassTag()).runtimeClass__jl_Class();
          if ((x !== null)) {
            var this$1 = $n(x);
            var $x_1 = (this$1 === $d_O.getClassOf());
          } else {
            var $x_1 = false;
          }
          if ($x_1) {
            var a1$3 = $n(as).sci_ArraySeq$ofRef__f_unsafeArray;
            break matchResult3;
          }
        }
        if ($is_sci_Iterable(it)) {
          var it$2 = $as_sci_Iterable(it);
          var a1 = new $ac_O(knownSize);
          var this$2 = $n(it$2);
          this$2.copyToArray__O__I__I__I(a1, 0, 2147483647);
          var a1$3 = a1;
          break matchResult3;
        }
        var a1$2 = new $ac_O(knownSize);
        var this$3 = $n($n(it).iterator__sc_Iterator());
        this$3.copyToArray__O__I__I__I(a1$2, 0, 2147483647);
        var a1$3 = a1$2;
      }
      return new $c_sci_Vector1(a1$3);
    } else {
      var this$4 = new $c_sci_VectorBuilder();
      var this$5 = $n(this$4.addAll__sc_IterableOnce__sci_VectorBuilder(it));
      return this$5.result__sci_Vector();
    }
  }
});
$c_sci_Vector$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sci_Vector(source);
});
var $d_sci_Vector$ = new $TypeData().initClass($c_sci_Vector$, "scala.collection.immutable.Vector$", ({
  sci_Vector$: 1,
  Ljava_io_Serializable: 1,
  sc_IterableFactory: 1,
  sc_SeqFactory: 1,
  sc_StrictOptimizedSeqFactory: 1
}));
var $n_sci_Vector$;
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$();
  }
  return $n_sci_Vector$;
}
function $p_sci_VectorBuilder__leftAlignPrefix__V($thiz) {
  var a = null;
  var aParent = null;
  if (($thiz.sci_VectorBuilder__f_depth >= 6)) {
    a = $thiz.sci_VectorBuilder__f_a6;
    var i = (($thiz.sci_VectorBuilder__f_offset >>> 25) | 0);
    if ((i > 0)) {
      var src = a;
      var dest = a;
      var length = ((64 - i) | 0);
      $systemArraycopyRefs($n(src), i, $n(dest), 0, length);
    }
    var num = $thiz.sci_VectorBuilder__f_offset;
    var t = (((num >> 24) >>> 7) | 0);
    var newOffset = (((33554431 & ((num + t) | 0)) - t) | 0);
    $thiz.sci_VectorBuilder__f_lenRest = (($thiz.sci_VectorBuilder__f_lenRest - (($thiz.sci_VectorBuilder__f_offset - newOffset) | 0)) | 0);
    $thiz.sci_VectorBuilder__f_offset = newOffset;
    if (((($thiz.sci_VectorBuilder__f_lenRest >>> 25) | 0) === 0)) {
      $thiz.sci_VectorBuilder__f_depth = 5;
    }
    aParent = a;
    a = $asArrayOf_O($n(a).get(0), 1);
  }
  if (($thiz.sci_VectorBuilder__f_depth >= 5)) {
    if ((a === null)) {
      a = $thiz.sci_VectorBuilder__f_a5;
    }
    var i$2 = (31 & (($thiz.sci_VectorBuilder__f_offset >>> 20) | 0));
    if (($thiz.sci_VectorBuilder__f_depth === 5)) {
      if ((i$2 > 0)) {
        var src$1 = a;
        var dest$1 = a;
        var length$1 = ((32 - i$2) | 0);
        $systemArraycopyRefs($n(src$1), i$2, $n(dest$1), 0, length$1);
      }
      $thiz.sci_VectorBuilder__f_a5 = $asArrayOf_O(a, 5);
      var num$1 = $thiz.sci_VectorBuilder__f_offset;
      var t$1 = (((num$1 >> 19) >>> 12) | 0);
      var newOffset$1 = (((1048575 & ((num$1 + t$1) | 0)) - t$1) | 0);
      $thiz.sci_VectorBuilder__f_lenRest = (($thiz.sci_VectorBuilder__f_lenRest - (($thiz.sci_VectorBuilder__f_offset - newOffset$1) | 0)) | 0);
      $thiz.sci_VectorBuilder__f_offset = newOffset$1;
      if (((($thiz.sci_VectorBuilder__f_lenRest >>> 20) | 0) === 0)) {
        $thiz.sci_VectorBuilder__f_depth = 4;
      }
    } else {
      if ((i$2 > 0)) {
        var original = a;
        a = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(original, i$2, 32);
      }
      $n(aParent).set(0, a);
    }
    aParent = a;
    a = $asArrayOf_O($n(a).get(0), 1);
  }
  if (($thiz.sci_VectorBuilder__f_depth >= 4)) {
    if ((a === null)) {
      a = $thiz.sci_VectorBuilder__f_a4;
    }
    var i$3 = (31 & (($thiz.sci_VectorBuilder__f_offset >>> 15) | 0));
    if (($thiz.sci_VectorBuilder__f_depth === 4)) {
      if ((i$3 > 0)) {
        var src$2 = a;
        var dest$2 = a;
        var length$2 = ((32 - i$3) | 0);
        $systemArraycopyRefs($n(src$2), i$3, $n(dest$2), 0, length$2);
      }
      $thiz.sci_VectorBuilder__f_a4 = $asArrayOf_O(a, 4);
      var num$2 = $thiz.sci_VectorBuilder__f_offset;
      var t$2 = (((num$2 >> 14) >>> 17) | 0);
      var newOffset$2 = (((32767 & ((num$2 + t$2) | 0)) - t$2) | 0);
      $thiz.sci_VectorBuilder__f_lenRest = (($thiz.sci_VectorBuilder__f_lenRest - (($thiz.sci_VectorBuilder__f_offset - newOffset$2) | 0)) | 0);
      $thiz.sci_VectorBuilder__f_offset = newOffset$2;
      if (((($thiz.sci_VectorBuilder__f_lenRest >>> 15) | 0) === 0)) {
        $thiz.sci_VectorBuilder__f_depth = 3;
      }
    } else {
      if ((i$3 > 0)) {
        var original$1 = a;
        a = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$1, i$3, 32);
      }
      $n(aParent).set(0, a);
    }
    aParent = a;
    a = $asArrayOf_O($n(a).get(0), 1);
  }
  if (($thiz.sci_VectorBuilder__f_depth >= 3)) {
    if ((a === null)) {
      a = $thiz.sci_VectorBuilder__f_a3;
    }
    var i$4 = (31 & (($thiz.sci_VectorBuilder__f_offset >>> 10) | 0));
    if (($thiz.sci_VectorBuilder__f_depth === 3)) {
      if ((i$4 > 0)) {
        var src$3 = a;
        var dest$3 = a;
        var length$3 = ((32 - i$4) | 0);
        $systemArraycopyRefs($n(src$3), i$4, $n(dest$3), 0, length$3);
      }
      $thiz.sci_VectorBuilder__f_a3 = $asArrayOf_O(a, 3);
      var num$3 = $thiz.sci_VectorBuilder__f_offset;
      var t$3 = (((num$3 >> 9) >>> 22) | 0);
      var newOffset$3 = (((1023 & ((num$3 + t$3) | 0)) - t$3) | 0);
      $thiz.sci_VectorBuilder__f_lenRest = (($thiz.sci_VectorBuilder__f_lenRest - (($thiz.sci_VectorBuilder__f_offset - newOffset$3) | 0)) | 0);
      $thiz.sci_VectorBuilder__f_offset = newOffset$3;
      if (((($thiz.sci_VectorBuilder__f_lenRest >>> 10) | 0) === 0)) {
        $thiz.sci_VectorBuilder__f_depth = 2;
      }
    } else {
      if ((i$4 > 0)) {
        var original$2 = a;
        a = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$2, i$4, 32);
      }
      $n(aParent).set(0, a);
    }
    aParent = a;
    a = $asArrayOf_O($n(a).get(0), 1);
  }
  if (($thiz.sci_VectorBuilder__f_depth >= 2)) {
    if ((a === null)) {
      a = $thiz.sci_VectorBuilder__f_a2;
    }
    var i$5 = (31 & (($thiz.sci_VectorBuilder__f_offset >>> 5) | 0));
    if (($thiz.sci_VectorBuilder__f_depth === 2)) {
      if ((i$5 > 0)) {
        var src$4 = a;
        var dest$4 = a;
        var length$4 = ((32 - i$5) | 0);
        $systemArraycopyRefs($n(src$4), i$5, $n(dest$4), 0, length$4);
      }
      $thiz.sci_VectorBuilder__f_a2 = $asArrayOf_O(a, 2);
      var num$4 = $thiz.sci_VectorBuilder__f_offset;
      var t$4 = (((num$4 >> 4) >>> 27) | 0);
      var newOffset$4 = (((31 & ((num$4 + t$4) | 0)) - t$4) | 0);
      $thiz.sci_VectorBuilder__f_lenRest = (($thiz.sci_VectorBuilder__f_lenRest - (($thiz.sci_VectorBuilder__f_offset - newOffset$4) | 0)) | 0);
      $thiz.sci_VectorBuilder__f_offset = newOffset$4;
      if (((($thiz.sci_VectorBuilder__f_lenRest >>> 5) | 0) === 0)) {
        $thiz.sci_VectorBuilder__f_depth = 1;
      }
    } else {
      if ((i$5 > 0)) {
        var original$3 = a;
        a = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$3, i$5, 32);
      }
      $n(aParent).set(0, a);
    }
    aParent = a;
    a = $asArrayOf_O($n(a).get(0), 1);
  }
  if (($thiz.sci_VectorBuilder__f_depth >= 1)) {
    if ((a === null)) {
      a = $thiz.sci_VectorBuilder__f_a1;
    }
    var i$6 = (31 & $thiz.sci_VectorBuilder__f_offset);
    if (($thiz.sci_VectorBuilder__f_depth === 1)) {
      if ((i$6 > 0)) {
        var src$5 = a;
        var dest$5 = a;
        var length$5 = ((32 - i$6) | 0);
        $systemArraycopyRefs($n(src$5), i$6, $n(dest$5), 0, length$5);
      }
      $thiz.sci_VectorBuilder__f_a1 = a;
      $thiz.sci_VectorBuilder__f_len1 = (($thiz.sci_VectorBuilder__f_len1 - $thiz.sci_VectorBuilder__f_offset) | 0);
      $thiz.sci_VectorBuilder__f_offset = 0;
    } else {
      if ((i$6 > 0)) {
        var original$4 = a;
        a = $m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$4, i$6, 32);
      }
      $n(aParent).set(0, a);
    }
  }
  $thiz.sci_VectorBuilder__f_prefixIsRightAligned = false;
}
function $p_sci_VectorBuilder__addArr1__AO__V($thiz, data) {
  var dl = $n(data).u.length;
  if ((dl > 0)) {
    if (($thiz.sci_VectorBuilder__f_len1 === 32)) {
      $p_sci_VectorBuilder__advance__V($thiz);
    }
    var a = ((32 - $thiz.sci_VectorBuilder__f_len1) | 0);
    var copy1 = ((a < dl) ? a : dl);
    var copy2 = ((dl - copy1) | 0);
    var dest = $thiz.sci_VectorBuilder__f_a1;
    var destPos = $thiz.sci_VectorBuilder__f_len1;
    $systemArraycopyRefs($n(data), 0, $n(dest), destPos, copy1);
    $thiz.sci_VectorBuilder__f_len1 = (($thiz.sci_VectorBuilder__f_len1 + copy1) | 0);
    if ((copy2 > 0)) {
      $p_sci_VectorBuilder__advance__V($thiz);
      var dest$1 = $thiz.sci_VectorBuilder__f_a1;
      $systemArraycopyRefs($n(data), copy1, $n(dest$1), 0, copy2);
      $thiz.sci_VectorBuilder__f_len1 = (($thiz.sci_VectorBuilder__f_len1 + copy2) | 0);
    }
  }
}
function $p_sci_VectorBuilder__addArrN__AO__I__V($thiz, slice, dim) {
  if (($n(slice).u.length === 0)) {
    return (void 0);
  }
  if (($thiz.sci_VectorBuilder__f_len1 === 32)) {
    $p_sci_VectorBuilder__advance__V($thiz);
  }
  var sl = $n(slice).u.length;
  switch (dim) {
    case 2: {
      var a = (31 & ((((1024 - $thiz.sci_VectorBuilder__f_lenRest) | 0) >>> 5) | 0));
      var copy1 = ((a < sl) ? a : sl);
      var copy2 = ((sl - copy1) | 0);
      var destPos = (31 & (($thiz.sci_VectorBuilder__f_lenRest >>> 5) | 0));
      var dest = $thiz.sci_VectorBuilder__f_a2;
      $systemArraycopyRefs($n(slice), 0, $n(dest), destPos, copy1);
      $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy1 << 5));
      if ((copy2 > 0)) {
        var dest$1 = $thiz.sci_VectorBuilder__f_a2;
        $systemArraycopyRefs($n(slice), copy1, $n(dest$1), 0, copy2);
        $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy2 << 5));
      }
      break;
    }
    case 3: {
      var num = $thiz.sci_VectorBuilder__f_lenRest;
      var t = (((num >> 9) >>> 22) | 0);
      if (((((1023 & ((num + t) | 0)) - t) | 0) !== 0)) {
        var f = ((e$3) => {
          $p_sci_VectorBuilder__addArrN__AO__I__V($thiz, $asArrayOf_O(e$3, 1), 2);
        });
        var len = $n(slice).u.length;
        var i = 0;
        if ((slice !== null)) {
          while ((i < len)) {
            var x0 = $n(slice).get(i);
            f(x0);
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_I)) {
          var x3 = $asArrayOf_I(slice, 1);
          while ((i < len)) {
            var x0$1 = $n(x3).get(i);
            f(x0$1);
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_D)) {
          var x4 = $asArrayOf_D(slice, 1);
          while ((i < len)) {
            var x0$2 = $n(x4).get(i);
            f(x0$2);
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_J)) {
          var x5 = $asArrayOf_J(slice, 1);
          while ((i < len)) {
            var $x_1 = $n(x5).u;
            var $x_2 = $aJCheckGet($x_1, i);
            var x0$3_$_lo = $x_1[$x_2];
            var x0$3_$_hi = $x_1[(($x_2 + 1) | 0)];
            f($bL(x0$3_$_lo, x0$3_$_hi));
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_F)) {
          var x6 = $asArrayOf_F(slice, 1);
          while ((i < len)) {
            var x0$4 = $n(x6).get(i);
            f(x0$4);
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_C)) {
          var x7 = $asArrayOf_C(slice, 1);
          while ((i < len)) {
            var x0$5 = $n(x7).get(i);
            f($bC(x0$5));
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_B)) {
          var x8 = $asArrayOf_B(slice, 1);
          while ((i < len)) {
            var x0$6 = $n(x8).get(i);
            f(x0$6);
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_S)) {
          var x9 = $asArrayOf_S(slice, 1);
          while ((i < len)) {
            var x0$7 = $n(x9).get(i);
            f(x0$7);
            i = ((1 + i) | 0);
          }
        } else if ((slice instanceof $ac_Z)) {
          var x10 = $asArrayOf_Z(slice, 1);
          while ((i < len)) {
            var x0$8 = $n(x10).get(i);
            f(x0$8);
            i = ((1 + i) | 0);
          }
        } else {
          throw new $c_s_MatchError(slice);
        }
        return (void 0);
      }
      var a$1 = (31 & ((((32768 - $thiz.sci_VectorBuilder__f_lenRest) | 0) >>> 10) | 0));
      var copy1$2 = ((a$1 < sl) ? a$1 : sl);
      var copy2$2 = ((sl - copy1$2) | 0);
      var destPos$2 = (31 & (($thiz.sci_VectorBuilder__f_lenRest >>> 10) | 0));
      var dest$2 = $thiz.sci_VectorBuilder__f_a3;
      $systemArraycopyRefs($n(slice), 0, $n(dest$2), destPos$2, copy1$2);
      $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy1$2 << 10));
      if ((copy2$2 > 0)) {
        var dest$3 = $thiz.sci_VectorBuilder__f_a3;
        $systemArraycopyRefs($n(slice), copy1$2, $n(dest$3), 0, copy2$2);
        $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy2$2 << 10));
      }
      break;
    }
    case 4: {
      var num$1 = $thiz.sci_VectorBuilder__f_lenRest;
      var t$1 = (((num$1 >> 14) >>> 17) | 0);
      if (((((32767 & ((num$1 + t$1) | 0)) - t$1) | 0) !== 0)) {
        var f$1 = ((e$3$1) => {
          $p_sci_VectorBuilder__addArrN__AO__I__V($thiz, $asArrayOf_O(e$3$1, 1), 3);
        });
        var len$1 = $n(slice).u.length;
        var i$1 = 0;
        if ((slice !== null)) {
          while ((i$1 < len$1)) {
            var x0$9 = $n(slice).get(i$1);
            f$1(x0$9);
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_I)) {
          var x3$1 = $asArrayOf_I(slice, 1);
          while ((i$1 < len$1)) {
            var x0$10 = $n(x3$1).get(i$1);
            f$1(x0$10);
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_D)) {
          var x4$1 = $asArrayOf_D(slice, 1);
          while ((i$1 < len$1)) {
            var x0$11 = $n(x4$1).get(i$1);
            f$1(x0$11);
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_J)) {
          var x5$1 = $asArrayOf_J(slice, 1);
          while ((i$1 < len$1)) {
            var $x_3 = $n(x5$1).u;
            var $x_4 = $aJCheckGet($x_3, i$1);
            var x0$12_$_lo = $x_3[$x_4];
            var x0$12_$_hi = $x_3[(($x_4 + 1) | 0)];
            f$1($bL(x0$12_$_lo, x0$12_$_hi));
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_F)) {
          var x6$1 = $asArrayOf_F(slice, 1);
          while ((i$1 < len$1)) {
            var x0$13 = $n(x6$1).get(i$1);
            f$1(x0$13);
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_C)) {
          var x7$1 = $asArrayOf_C(slice, 1);
          while ((i$1 < len$1)) {
            var x0$14 = $n(x7$1).get(i$1);
            f$1($bC(x0$14));
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_B)) {
          var x8$1 = $asArrayOf_B(slice, 1);
          while ((i$1 < len$1)) {
            var x0$15 = $n(x8$1).get(i$1);
            f$1(x0$15);
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_S)) {
          var x9$1 = $asArrayOf_S(slice, 1);
          while ((i$1 < len$1)) {
            var x0$16 = $n(x9$1).get(i$1);
            f$1(x0$16);
            i$1 = ((1 + i$1) | 0);
          }
        } else if ((slice instanceof $ac_Z)) {
          var x10$1 = $asArrayOf_Z(slice, 1);
          while ((i$1 < len$1)) {
            var x0$17 = $n(x10$1).get(i$1);
            f$1(x0$17);
            i$1 = ((1 + i$1) | 0);
          }
        } else {
          throw new $c_s_MatchError(slice);
        }
        return (void 0);
      }
      var a$2 = (31 & ((((1048576 - $thiz.sci_VectorBuilder__f_lenRest) | 0) >>> 15) | 0));
      var copy1$3 = ((a$2 < sl) ? a$2 : sl);
      var copy2$3 = ((sl - copy1$3) | 0);
      var destPos$3 = (31 & (($thiz.sci_VectorBuilder__f_lenRest >>> 15) | 0));
      var dest$4 = $thiz.sci_VectorBuilder__f_a4;
      $systemArraycopyRefs($n(slice), 0, $n(dest$4), destPos$3, copy1$3);
      $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy1$3 << 15));
      if ((copy2$3 > 0)) {
        var dest$5 = $thiz.sci_VectorBuilder__f_a4;
        $systemArraycopyRefs($n(slice), copy1$3, $n(dest$5), 0, copy2$3);
        $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy2$3 << 15));
      }
      break;
    }
    case 5: {
      var num$2 = $thiz.sci_VectorBuilder__f_lenRest;
      var t$2 = (((num$2 >> 19) >>> 12) | 0);
      if (((((1048575 & ((num$2 + t$2) | 0)) - t$2) | 0) !== 0)) {
        var f$2 = ((e$3$2) => {
          $p_sci_VectorBuilder__addArrN__AO__I__V($thiz, $asArrayOf_O(e$3$2, 1), 4);
        });
        var len$2 = $n(slice).u.length;
        var i$2 = 0;
        if ((slice !== null)) {
          while ((i$2 < len$2)) {
            var x0$18 = $n(slice).get(i$2);
            f$2(x0$18);
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_I)) {
          var x3$2 = $asArrayOf_I(slice, 1);
          while ((i$2 < len$2)) {
            var x0$19 = $n(x3$2).get(i$2);
            f$2(x0$19);
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_D)) {
          var x4$2 = $asArrayOf_D(slice, 1);
          while ((i$2 < len$2)) {
            var x0$20 = $n(x4$2).get(i$2);
            f$2(x0$20);
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_J)) {
          var x5$2 = $asArrayOf_J(slice, 1);
          while ((i$2 < len$2)) {
            var $x_5 = $n(x5$2).u;
            var $x_6 = $aJCheckGet($x_5, i$2);
            var x0$21_$_lo = $x_5[$x_6];
            var x0$21_$_hi = $x_5[(($x_6 + 1) | 0)];
            f$2($bL(x0$21_$_lo, x0$21_$_hi));
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_F)) {
          var x6$2 = $asArrayOf_F(slice, 1);
          while ((i$2 < len$2)) {
            var x0$22 = $n(x6$2).get(i$2);
            f$2(x0$22);
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_C)) {
          var x7$2 = $asArrayOf_C(slice, 1);
          while ((i$2 < len$2)) {
            var x0$23 = $n(x7$2).get(i$2);
            f$2($bC(x0$23));
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_B)) {
          var x8$2 = $asArrayOf_B(slice, 1);
          while ((i$2 < len$2)) {
            var x0$24 = $n(x8$2).get(i$2);
            f$2(x0$24);
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_S)) {
          var x9$2 = $asArrayOf_S(slice, 1);
          while ((i$2 < len$2)) {
            var x0$25 = $n(x9$2).get(i$2);
            f$2(x0$25);
            i$2 = ((1 + i$2) | 0);
          }
        } else if ((slice instanceof $ac_Z)) {
          var x10$2 = $asArrayOf_Z(slice, 1);
          while ((i$2 < len$2)) {
            var x0$26 = $n(x10$2).get(i$2);
            f$2(x0$26);
            i$2 = ((1 + i$2) | 0);
          }
        } else {
          throw new $c_s_MatchError(slice);
        }
        return (void 0);
      }
      var a$3 = (31 & ((((33554432 - $thiz.sci_VectorBuilder__f_lenRest) | 0) >>> 20) | 0));
      var copy1$4 = ((a$3 < sl) ? a$3 : sl);
      var copy2$4 = ((sl - copy1$4) | 0);
      var destPos$4 = (31 & (($thiz.sci_VectorBuilder__f_lenRest >>> 20) | 0));
      var dest$6 = $thiz.sci_VectorBuilder__f_a5;
      $systemArraycopyRefs($n(slice), 0, $n(dest$6), destPos$4, copy1$4);
      $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy1$4 << 20));
      if ((copy2$4 > 0)) {
        var dest$7 = $thiz.sci_VectorBuilder__f_a5;
        $systemArraycopyRefs($n(slice), copy1$4, $n(dest$7), 0, copy2$4);
        $p_sci_VectorBuilder__advanceN__I__V($thiz, (copy2$4 << 20));
      }
      break;
    }
    case 6: {
      var num$3 = $thiz.sci_VectorBuilder__f_lenRest;
      var t$3 = (((num$3 >> 24) >>> 7) | 0);
      if (((((33554431 & ((num$3 + t$3) | 0)) - t$3) | 0) !== 0)) {
        var f$3 = ((e$3$3) => {
          $p_sci_VectorBuilder__addArrN__AO__I__V($thiz, $asArrayOf_O(e$3$3, 1), 5);
        });
        var len$3 = $n(slice).u.length;
        var i$3 = 0;
        if ((slice !== null)) {
          while ((i$3 < len$3)) {
            var x0$27 = $n(slice).get(i$3);
            f$3(x0$27);
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_I)) {
          var x3$3 = $asArrayOf_I(slice, 1);
          while ((i$3 < len$3)) {
            var x0$28 = $n(x3$3).get(i$3);
            f$3(x0$28);
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_D)) {
          var x4$3 = $asArrayOf_D(slice, 1);
          while ((i$3 < len$3)) {
            var x0$29 = $n(x4$3).get(i$3);
            f$3(x0$29);
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_J)) {
          var x5$3 = $asArrayOf_J(slice, 1);
          while ((i$3 < len$3)) {
            var $x_7 = $n(x5$3).u;
            var $x_8 = $aJCheckGet($x_7, i$3);
            var x0$30_$_lo = $x_7[$x_8];
            var x0$30_$_hi = $x_7[(($x_8 + 1) | 0)];
            f$3($bL(x0$30_$_lo, x0$30_$_hi));
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_F)) {
          var x6$3 = $asArrayOf_F(slice, 1);
          while ((i$3 < len$3)) {
            var x0$31 = $n(x6$3).get(i$3);
            f$3(x0$31);
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_C)) {
          var x7$3 = $asArrayOf_C(slice, 1);
          while ((i$3 < len$3)) {
            var x0$32 = $n(x7$3).get(i$3);
            f$3($bC(x0$32));
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_B)) {
          var x8$3 = $asArrayOf_B(slice, 1);
          while ((i$3 < len$3)) {
            var x0$33 = $n(x8$3).get(i$3);
            f$3(x0$33);
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_S)) {
          var x9$3 = $asArrayOf_S(slice, 1);
          while ((i$3 < len$3)) {
            var x0$34 = $n(x9$3).get(i$3);
            f$3(x0$34);
            i$3 = ((1 + i$3) | 0);
          }
        } else if ((slice instanceof $ac_Z)) {
          var x10$3 = $asArrayOf_Z(slice, 1);
          while ((i$3 < len$3)) {
            var x0$35 = $n(x10$3).get(i$3);
            f$3(x0$35);
            i$3 = ((1 + i$3) | 0);
          }
        } else {
          throw new $c_s_MatchError(slice);
        }
        return (void 0);
      }
      var destPos$5 = (($thiz.sci_VectorBuilder__f_lenRest >>> 25) | 0);
      if ((((destPos$5 + sl) | 0) > 64)) {
        throw $ct_jl_IllegalArgumentException__T__(new $c_jl_IllegalArgumentException(), "exceeding 2^31 elements");
      }
      var dest$8 = $thiz.sci_VectorBuilder__f_a6;
      $systemArraycopyRefs($n(slice), 0, $n(dest$8), destPos$5, sl);
      $p_sci_VectorBuilder__advanceN__I__V($thiz, (sl << 25));
      break;
    }
    default: {
      throw new $c_s_MatchError(dim);
    }
  }
}
function $p_sci_VectorBuilder__addVector__sci_Vector__sci_VectorBuilder($thiz, xs) {
  var sliceCount = $n(xs).vectorSliceCount__I();
  var sliceIdx = 0;
  while ((sliceIdx < sliceCount)) {
    var slice = $n(xs).vectorSlice__I__AO(sliceIdx);
    matchResult26: {
      var idx = sliceIdx;
      var c = (((sliceCount + ((sliceCount >>> 31) | 0)) | 0) >> 1);
      var a = ((idx - c) | 0);
      var sign = (a >> 31);
      var x37 = ((((1 + c) | 0) - (((a ^ sign) - sign) | 0)) | 0);
      if ((x37 === 1)) {
        $p_sci_VectorBuilder__addArr1__AO__V($thiz, slice);
        break matchResult26;
      }
      if ((($thiz.sci_VectorBuilder__f_len1 === 32) || ($thiz.sci_VectorBuilder__f_len1 === 0))) {
        $p_sci_VectorBuilder__addArrN__AO__I__V($thiz, slice, x37);
        break matchResult26;
      }
      $m_sci_VectorStatics$().foreachRec__I__AO__F1__V(((x37 - 2) | 0), slice, new $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(((data$3) => {
        var data = $asArrayOf_O(data$3, 1);
        $p_sci_VectorBuilder__addArr1__AO__V($thiz, data);
      })));
    }
    sliceIdx = ((1 + sliceIdx) | 0);
  }
  return $thiz;
}
function $p_sci_VectorBuilder__advance__V($thiz) {
  var idx = ((32 + $thiz.sci_VectorBuilder__f_lenRest) | 0);
  var xor = (idx ^ $thiz.sci_VectorBuilder__f_lenRest);
  $thiz.sci_VectorBuilder__f_lenRest = idx;
  $thiz.sci_VectorBuilder__f_len1 = 0;
  $p_sci_VectorBuilder__advance1__I__I__V($thiz, idx, xor);
}
function $p_sci_VectorBuilder__advanceN__I__V($thiz, n) {
  if ((n > 0)) {
    var idx = (($thiz.sci_VectorBuilder__f_lenRest + n) | 0);
    var xor = (idx ^ $thiz.sci_VectorBuilder__f_lenRest);
    $thiz.sci_VectorBuilder__f_lenRest = idx;
    $thiz.sci_VectorBuilder__f_len1 = 0;
    $p_sci_VectorBuilder__advance1__I__I__V($thiz, idx, xor);
  }
}
function $p_sci_VectorBuilder__advance1__I__I__V($thiz, idx, xor) {
  if ((xor <= 0)) {
    throw $ct_jl_IllegalArgumentException__T__(new $c_jl_IllegalArgumentException(), ((((((((((((((((("advance1(" + idx) + ", ") + xor) + "): a1=") + $thiz.sci_VectorBuilder__f_a1) + ", a2=") + $thiz.sci_VectorBuilder__f_a2) + ", a3=") + $thiz.sci_VectorBuilder__f_a3) + ", a4=") + $thiz.sci_VectorBuilder__f_a4) + ", a5=") + $thiz.sci_VectorBuilder__f_a5) + ", a6=") + $thiz.sci_VectorBuilder__f_a6) + ", depth=") + $thiz.sci_VectorBuilder__f_depth));
  } else if ((xor < 1024)) {
    if (($thiz.sci_VectorBuilder__f_depth <= 1)) {
      $thiz.sci_VectorBuilder__f_a2 = new ($d_O.getArrayOf().getArrayOf().constr)(32);
      $n($thiz.sci_VectorBuilder__f_a2).set(0, $thiz.sci_VectorBuilder__f_a1);
      $thiz.sci_VectorBuilder__f_depth = 2;
    }
    $thiz.sci_VectorBuilder__f_a1 = new $ac_O(32);
    $n($thiz.sci_VectorBuilder__f_a2).set((31 & ((idx >>> 5) | 0)), $thiz.sci_VectorBuilder__f_a1);
  } else if ((xor < 32768)) {
    if (($thiz.sci_VectorBuilder__f_depth <= 2)) {
      $thiz.sci_VectorBuilder__f_a3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(32);
      $n($thiz.sci_VectorBuilder__f_a3).set(0, $thiz.sci_VectorBuilder__f_a2);
      $thiz.sci_VectorBuilder__f_depth = 3;
    }
    $thiz.sci_VectorBuilder__f_a1 = new $ac_O(32);
    $thiz.sci_VectorBuilder__f_a2 = new ($d_O.getArrayOf().getArrayOf().constr)(32);
    $n($thiz.sci_VectorBuilder__f_a2).set((31 & ((idx >>> 5) | 0)), $thiz.sci_VectorBuilder__f_a1);
    $n($thiz.sci_VectorBuilder__f_a3).set((31 & ((idx >>> 10) | 0)), $thiz.sci_VectorBuilder__f_a2);
  } else if ((xor < 1048576)) {
    if (($thiz.sci_VectorBuilder__f_depth <= 3)) {
      $thiz.sci_VectorBuilder__f_a4 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
      $n($thiz.sci_VectorBuilder__f_a4).set(0, $thiz.sci_VectorBuilder__f_a3);
      $thiz.sci_VectorBuilder__f_depth = 4;
    }
    $thiz.sci_VectorBuilder__f_a1 = new $ac_O(32);
    $thiz.sci_VectorBuilder__f_a2 = new ($d_O.getArrayOf().getArrayOf().constr)(32);
    $thiz.sci_VectorBuilder__f_a3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(32);
    $n($thiz.sci_VectorBuilder__f_a2).set((31 & ((idx >>> 5) | 0)), $thiz.sci_VectorBuilder__f_a1);
    $n($thiz.sci_VectorBuilder__f_a3).set((31 & ((idx >>> 10) | 0)), $thiz.sci_VectorBuilder__f_a2);
    $n($thiz.sci_VectorBuilder__f_a4).set((31 & ((idx >>> 15) | 0)), $thiz.sci_VectorBuilder__f_a3);
  } else if ((xor < 33554432)) {
    if (($thiz.sci_VectorBuilder__f_depth <= 4)) {
      $thiz.sci_VectorBuilder__f_a5 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
      $n($thiz.sci_VectorBuilder__f_a5).set(0, $thiz.sci_VectorBuilder__f_a4);
      $thiz.sci_VectorBuilder__f_depth = 5;
    }
    $thiz.sci_VectorBuilder__f_a1 = new $ac_O(32);
    $thiz.sci_VectorBuilder__f_a2 = new ($d_O.getArrayOf().getArrayOf().constr)(32);
    $thiz.sci_VectorBuilder__f_a3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(32);
    $thiz.sci_VectorBuilder__f_a4 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
    $n($thiz.sci_VectorBuilder__f_a2).set((31 & ((idx >>> 5) | 0)), $thiz.sci_VectorBuilder__f_a1);
    $n($thiz.sci_VectorBuilder__f_a3).set((31 & ((idx >>> 10) | 0)), $thiz.sci_VectorBuilder__f_a2);
    $n($thiz.sci_VectorBuilder__f_a4).set((31 & ((idx >>> 15) | 0)), $thiz.sci_VectorBuilder__f_a3);
    $n($thiz.sci_VectorBuilder__f_a5).set((31 & ((idx >>> 20) | 0)), $thiz.sci_VectorBuilder__f_a4);
  } else {
    if (($thiz.sci_VectorBuilder__f_depth <= 5)) {
      $thiz.sci_VectorBuilder__f_a6 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(64);
      $n($thiz.sci_VectorBuilder__f_a6).set(0, $thiz.sci_VectorBuilder__f_a5);
      $thiz.sci_VectorBuilder__f_depth = 6;
    }
    $thiz.sci_VectorBuilder__f_a1 = new $ac_O(32);
    $thiz.sci_VectorBuilder__f_a2 = new ($d_O.getArrayOf().getArrayOf().constr)(32);
    $thiz.sci_VectorBuilder__f_a3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(32);
    $thiz.sci_VectorBuilder__f_a4 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
    $thiz.sci_VectorBuilder__f_a5 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
    $n($thiz.sci_VectorBuilder__f_a2).set((31 & ((idx >>> 5) | 0)), $thiz.sci_VectorBuilder__f_a1);
    $n($thiz.sci_VectorBuilder__f_a3).set((31 & ((idx >>> 10) | 0)), $thiz.sci_VectorBuilder__f_a2);
    $n($thiz.sci_VectorBuilder__f_a4).set((31 & ((idx >>> 15) | 0)), $thiz.sci_VectorBuilder__f_a3);
    $n($thiz.sci_VectorBuilder__f_a5).set((31 & ((idx >>> 20) | 0)), $thiz.sci_VectorBuilder__f_a4);
    $n($thiz.sci_VectorBuilder__f_a6).set(((idx >>> 25) | 0), $thiz.sci_VectorBuilder__f_a5);
  }
}
/** @constructor */
function $c_sci_VectorBuilder() {
  this.sci_VectorBuilder__f_a6 = null;
  this.sci_VectorBuilder__f_a5 = null;
  this.sci_VectorBuilder__f_a4 = null;
  this.sci_VectorBuilder__f_a3 = null;
  this.sci_VectorBuilder__f_a2 = null;
  this.sci_VectorBuilder__f_a1 = null;
  this.sci_VectorBuilder__f_len1 = 0;
  this.sci_VectorBuilder__f_lenRest = 0;
  this.sci_VectorBuilder__f_offset = 0;
  this.sci_VectorBuilder__f_prefixIsRightAligned = false;
  this.sci_VectorBuilder__f_depth = 0;
  this.sci_VectorBuilder__f_a1 = new $ac_O(32);
  this.sci_VectorBuilder__f_len1 = 0;
  this.sci_VectorBuilder__f_lenRest = 0;
  this.sci_VectorBuilder__f_offset = 0;
  this.sci_VectorBuilder__f_prefixIsRightAligned = false;
  this.sci_VectorBuilder__f_depth = 1;
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.initFrom__sci_Vector__sci_VectorBuilder = (function(v) {
  var x28 = $n(v).vectorSliceCount__I();
  switch (x28) {
    case 0: {
      break;
    }
    case 1: {
      var v1 = $as_sci_Vector1(v);
      this.sci_VectorBuilder__f_depth = 1;
      var i = $n($n(v1).sci_Vector__f_prefix1).u.length;
      this.sci_VectorBuilder__f_len1 = (31 & i);
      this.sci_VectorBuilder__f_lenRest = ((i - this.sci_VectorBuilder__f_len1) | 0);
      var a = $n(v1).sci_Vector__f_prefix1;
      this.sci_VectorBuilder__f_a1 = (($n(a).u.length === 32) ? a : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a, 0, 32));
      break;
    }
    case 3: {
      var v2 = $as_sci_Vector2(v);
      var d2 = $n(v2).sci_Vector2__f_data2;
      var a$1 = $n(v2).sci_BigVector__f_suffix1;
      this.sci_VectorBuilder__f_a1 = (($n(a$1).u.length === 32) ? a$1 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$1, 0, 32));
      this.sci_VectorBuilder__f_depth = 2;
      this.sci_VectorBuilder__f_offset = ((32 - $n(v2).sci_Vector2__f_len1) | 0);
      var i$1 = (($n(v2).sci_BigVector__f_length0 + this.sci_VectorBuilder__f_offset) | 0);
      this.sci_VectorBuilder__f_len1 = (31 & i$1);
      this.sci_VectorBuilder__f_lenRest = ((i$1 - this.sci_VectorBuilder__f_len1) | 0);
      this.sci_VectorBuilder__f_a2 = new ($d_O.getArrayOf().getArrayOf().constr)(32);
      $n(this.sci_VectorBuilder__f_a2).set(0, $n(v2).sci_Vector__f_prefix1);
      var dest = this.sci_VectorBuilder__f_a2;
      var length = $n(d2).u.length;
      $systemArraycopyRefs($n(d2), 0, $n(dest), 1, length);
      $n(this.sci_VectorBuilder__f_a2).set(((1 + $n(d2).u.length) | 0), this.sci_VectorBuilder__f_a1);
      break;
    }
    case 5: {
      var v3 = $as_sci_Vector3(v);
      var d3 = $n(v3).sci_Vector3__f_data3;
      var s2 = $n(v3).sci_Vector3__f_suffix2;
      var a$2 = $n(v3).sci_BigVector__f_suffix1;
      this.sci_VectorBuilder__f_a1 = (($n(a$2).u.length === 32) ? a$2 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$2, 0, 32));
      this.sci_VectorBuilder__f_depth = 3;
      this.sci_VectorBuilder__f_offset = ((1024 - $n(v3).sci_Vector3__f_len12) | 0);
      var i$2 = (($n(v3).sci_BigVector__f_length0 + this.sci_VectorBuilder__f_offset) | 0);
      this.sci_VectorBuilder__f_len1 = (31 & i$2);
      this.sci_VectorBuilder__f_lenRest = ((i$2 - this.sci_VectorBuilder__f_len1) | 0);
      this.sci_VectorBuilder__f_a3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(32);
      $n(this.sci_VectorBuilder__f_a3).set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($n(v3).sci_Vector__f_prefix1, $n(v3).sci_Vector3__f_prefix2), 2));
      var dest$1 = this.sci_VectorBuilder__f_a3;
      var length$1 = $n(d3).u.length;
      $systemArraycopyRefs($n(d3), 0, $n(dest$1), 1, length$1);
      this.sci_VectorBuilder__f_a2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2, 32), 2);
      $n(this.sci_VectorBuilder__f_a3).set(((1 + $n(d3).u.length) | 0), this.sci_VectorBuilder__f_a2);
      $n(this.sci_VectorBuilder__f_a2).set($n(s2).u.length, this.sci_VectorBuilder__f_a1);
      break;
    }
    case 7: {
      var v4 = $as_sci_Vector4(v);
      var d4 = $n(v4).sci_Vector4__f_data4;
      var s3 = $n(v4).sci_Vector4__f_suffix3;
      var s2$2 = $n(v4).sci_Vector4__f_suffix2;
      var a$3 = $n(v4).sci_BigVector__f_suffix1;
      this.sci_VectorBuilder__f_a1 = (($n(a$3).u.length === 32) ? a$3 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$3, 0, 32));
      this.sci_VectorBuilder__f_depth = 4;
      this.sci_VectorBuilder__f_offset = ((32768 - $n(v4).sci_Vector4__f_len123) | 0);
      var i$3 = (($n(v4).sci_BigVector__f_length0 + this.sci_VectorBuilder__f_offset) | 0);
      this.sci_VectorBuilder__f_len1 = (31 & i$3);
      this.sci_VectorBuilder__f_lenRest = ((i$3 - this.sci_VectorBuilder__f_len1) | 0);
      this.sci_VectorBuilder__f_a4 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
      $n(this.sci_VectorBuilder__f_a4).set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($n(v4).sci_Vector__f_prefix1, $n(v4).sci_Vector4__f_prefix2), $n(v4).sci_Vector4__f_prefix3), 3));
      var dest$2 = this.sci_VectorBuilder__f_a4;
      var length$2 = $n(d4).u.length;
      $systemArraycopyRefs($n(d4), 0, $n(dest$2), 1, length$2);
      this.sci_VectorBuilder__f_a3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s3, 32), 3);
      this.sci_VectorBuilder__f_a2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2$2, 32), 2);
      $n(this.sci_VectorBuilder__f_a4).set(((1 + $n(d4).u.length) | 0), this.sci_VectorBuilder__f_a3);
      $n(this.sci_VectorBuilder__f_a3).set($n(s3).u.length, this.sci_VectorBuilder__f_a2);
      $n(this.sci_VectorBuilder__f_a2).set($n(s2$2).u.length, this.sci_VectorBuilder__f_a1);
      break;
    }
    case 9: {
      var v5 = $as_sci_Vector5(v);
      var d5 = $n(v5).sci_Vector5__f_data5;
      var s4 = $n(v5).sci_Vector5__f_suffix4;
      var s3$2 = $n(v5).sci_Vector5__f_suffix3;
      var s2$3 = $n(v5).sci_Vector5__f_suffix2;
      var a$4 = $n(v5).sci_BigVector__f_suffix1;
      this.sci_VectorBuilder__f_a1 = (($n(a$4).u.length === 32) ? a$4 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$4, 0, 32));
      this.sci_VectorBuilder__f_depth = 5;
      this.sci_VectorBuilder__f_offset = ((1048576 - $n(v5).sci_Vector5__f_len1234) | 0);
      var i$4 = (($n(v5).sci_BigVector__f_length0 + this.sci_VectorBuilder__f_offset) | 0);
      this.sci_VectorBuilder__f_len1 = (31 & i$4);
      this.sci_VectorBuilder__f_lenRest = ((i$4 - this.sci_VectorBuilder__f_len1) | 0);
      this.sci_VectorBuilder__f_a5 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(32);
      $n(this.sci_VectorBuilder__f_a5).set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($n(v5).sci_Vector__f_prefix1, $n(v5).sci_Vector5__f_prefix2), $n(v5).sci_Vector5__f_prefix3), $n(v5).sci_Vector5__f_prefix4), 4));
      var dest$3 = this.sci_VectorBuilder__f_a5;
      var length$3 = $n(d5).u.length;
      $systemArraycopyRefs($n(d5), 0, $n(dest$3), 1, length$3);
      this.sci_VectorBuilder__f_a4 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s4, 32), 4);
      this.sci_VectorBuilder__f_a3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s3$2, 32), 3);
      this.sci_VectorBuilder__f_a2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2$3, 32), 2);
      $n(this.sci_VectorBuilder__f_a5).set(((1 + $n(d5).u.length) | 0), this.sci_VectorBuilder__f_a4);
      $n(this.sci_VectorBuilder__f_a4).set($n(s4).u.length, this.sci_VectorBuilder__f_a3);
      $n(this.sci_VectorBuilder__f_a3).set($n(s3$2).u.length, this.sci_VectorBuilder__f_a2);
      $n(this.sci_VectorBuilder__f_a2).set($n(s2$3).u.length, this.sci_VectorBuilder__f_a1);
      break;
    }
    case 11: {
      var v6 = $as_sci_Vector6(v);
      var d6 = $n(v6).sci_Vector6__f_data6;
      var s5 = $n(v6).sci_Vector6__f_suffix5;
      var s4$2 = $n(v6).sci_Vector6__f_suffix4;
      var s3$3 = $n(v6).sci_Vector6__f_suffix3;
      var s2$4 = $n(v6).sci_Vector6__f_suffix2;
      var a$5 = $n(v6).sci_BigVector__f_suffix1;
      this.sci_VectorBuilder__f_a1 = (($n(a$5).u.length === 32) ? a$5 : $m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$5, 0, 32));
      this.sci_VectorBuilder__f_depth = 6;
      this.sci_VectorBuilder__f_offset = ((33554432 - $n(v6).sci_Vector6__f_len12345) | 0);
      var i$5 = (($n(v6).sci_BigVector__f_length0 + this.sci_VectorBuilder__f_offset) | 0);
      this.sci_VectorBuilder__f_len1 = (31 & i$5);
      this.sci_VectorBuilder__f_lenRest = ((i$5 - this.sci_VectorBuilder__f_len1) | 0);
      this.sci_VectorBuilder__f_a6 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(64);
      $n(this.sci_VectorBuilder__f_a6).set(0, $asArrayOf_O($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($m_sci_VectorStatics$().copyPrepend__O__AO__AO($n(v6).sci_Vector__f_prefix1, $n(v6).sci_Vector6__f_prefix2), $n(v6).sci_Vector6__f_prefix3), $n(v6).sci_Vector6__f_prefix4), $n(v6).sci_Vector6__f_prefix5), 5));
      var dest$4 = this.sci_VectorBuilder__f_a6;
      var length$4 = $n(d6).u.length;
      $systemArraycopyRefs($n(d6), 0, $n(dest$4), 1, length$4);
      this.sci_VectorBuilder__f_a5 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s5, 32), 5);
      this.sci_VectorBuilder__f_a4 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s4$2, 32), 4);
      this.sci_VectorBuilder__f_a3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s3$3, 32), 3);
      this.sci_VectorBuilder__f_a2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(s2$4, 32), 2);
      $n(this.sci_VectorBuilder__f_a6).set(((1 + $n(d6).u.length) | 0), this.sci_VectorBuilder__f_a5);
      $n(this.sci_VectorBuilder__f_a5).set($n(s5).u.length, this.sci_VectorBuilder__f_a4);
      $n(this.sci_VectorBuilder__f_a4).set($n(s4$2).u.length, this.sci_VectorBuilder__f_a3);
      $n(this.sci_VectorBuilder__f_a3).set($n(s3$3).u.length, this.sci_VectorBuilder__f_a2);
      $n(this.sci_VectorBuilder__f_a2).set($n(s2$4).u.length, this.sci_VectorBuilder__f_a1);
      break;
    }
    default: {
      throw new $c_s_MatchError(x28);
    }
  }
  if (((this.sci_VectorBuilder__f_len1 === 0) && (this.sci_VectorBuilder__f_lenRest > 0))) {
    this.sci_VectorBuilder__f_len1 = 32;
    this.sci_VectorBuilder__f_lenRest = ((this.sci_VectorBuilder__f_lenRest - 32) | 0);
  }
  return this;
});
$c_sci_VectorBuilder.prototype.addOne__O__sci_VectorBuilder = (function(elem) {
  if ((this.sci_VectorBuilder__f_len1 === 32)) {
    $p_sci_VectorBuilder__advance__V(this);
  }
  $n(this.sci_VectorBuilder__f_a1).set(this.sci_VectorBuilder__f_len1, elem);
  this.sci_VectorBuilder__f_len1 = ((1 + this.sci_VectorBuilder__f_len1) | 0);
  return this;
});
$c_sci_VectorBuilder.prototype.addAll__sc_IterableOnce__sci_VectorBuilder = (function(xs) {
  if ((xs instanceof $c_sci_Vector)) {
    var v = $as_sci_Vector(xs);
    return ((((this.sci_VectorBuilder__f_len1 === 0) && (this.sci_VectorBuilder__f_lenRest === 0)) && (!this.sci_VectorBuilder__f_prefixIsRightAligned)) ? this.initFrom__sci_Vector__sci_VectorBuilder(v) : $p_sci_VectorBuilder__addVector__sci_Vector__sci_VectorBuilder(this, v));
  } else {
    return $as_sci_VectorBuilder($f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, xs));
  }
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  if (this.sci_VectorBuilder__f_prefixIsRightAligned) {
    $p_sci_VectorBuilder__leftAlignPrefix__V(this);
  }
  var len = ((this.sci_VectorBuilder__f_len1 + this.sci_VectorBuilder__f_lenRest) | 0);
  var realLen = ((len - this.sci_VectorBuilder__f_offset) | 0);
  if ((realLen === 0)) {
    $m_sci_Vector$();
    return $m_sci_Vector0$();
  } else if ((len < 0)) {
    throw $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), ("Vector cannot have negative size " + len));
  } else if ((len <= 32)) {
    var a = this.sci_VectorBuilder__f_a1;
    return new $c_sci_Vector1((($n(a).u.length === realLen) ? a : $m_ju_Arrays$().copyOf__AO__I__AO(a, realLen)));
  } else if ((len <= 1024)) {
    var i1 = (31 & ((len - 1) | 0));
    var i2 = ((((len - 1) | 0) >>> 5) | 0);
    var original = this.sci_VectorBuilder__f_a2;
    var data = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(original, 1, i2), 2);
    var prefix1 = $n(this.sci_VectorBuilder__f_a2).get(0);
    var a$1 = $n(this.sci_VectorBuilder__f_a2).get(i2);
    var len$1 = ((1 + i1) | 0);
    var suffix1 = (($n(a$1).u.length === len$1) ? a$1 : $m_ju_Arrays$().copyOf__AO__I__AO(a$1, len$1));
    return new $c_sci_Vector2(prefix1, ((32 - this.sci_VectorBuilder__f_offset) | 0), data, suffix1, realLen);
  } else if ((len <= 32768)) {
    var i1$2 = (31 & ((len - 1) | 0));
    var i2$2 = (31 & ((((len - 1) | 0) >>> 5) | 0));
    var i3 = ((((len - 1) | 0) >>> 10) | 0);
    var original$1 = this.sci_VectorBuilder__f_a3;
    var data$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$1, 1, i3), 3);
    var a$2 = $n(this.sci_VectorBuilder__f_a3).get(0);
    var to = $n(a$2).u.length;
    var prefix2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$2, 1, to), 2);
    var prefix1$2 = $n($n(this.sci_VectorBuilder__f_a3).get(0)).get(0);
    var original$2 = $n(this.sci_VectorBuilder__f_a3).get(i3);
    var suffix2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$2, i2$2), 2);
    var a$3 = $n($n(this.sci_VectorBuilder__f_a3).get(i3)).get(i2$2);
    var len$2 = ((1 + i1$2) | 0);
    var suffix1$2 = (($n(a$3).u.length === len$2) ? a$3 : $m_ju_Arrays$().copyOf__AO__I__AO(a$3, len$2));
    var len1 = $n(prefix1$2).u.length;
    var len12 = ((len1 + ($n(prefix2).u.length << 5)) | 0);
    return new $c_sci_Vector3(prefix1$2, len1, prefix2, len12, data$2, suffix2, suffix1$2, realLen);
  } else if ((len <= 1048576)) {
    var i1$3 = (31 & ((len - 1) | 0));
    var i2$3 = (31 & ((((len - 1) | 0) >>> 5) | 0));
    var i3$2 = (31 & ((((len - 1) | 0) >>> 10) | 0));
    var i4 = ((((len - 1) | 0) >>> 15) | 0);
    var original$3 = this.sci_VectorBuilder__f_a4;
    var data$3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$3, 1, i4), 4);
    var a$4 = $n(this.sci_VectorBuilder__f_a4).get(0);
    var to$1 = $n(a$4).u.length;
    var prefix3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$4, 1, to$1), 3);
    var a$5 = $n($n(this.sci_VectorBuilder__f_a4).get(0)).get(0);
    var to$2 = $n(a$5).u.length;
    var prefix2$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$5, 1, to$2), 2);
    var prefix1$3 = $n($n($n(this.sci_VectorBuilder__f_a4).get(0)).get(0)).get(0);
    var original$4 = $n(this.sci_VectorBuilder__f_a4).get(i4);
    var suffix3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$4, i3$2), 3);
    var original$5 = $n($n(this.sci_VectorBuilder__f_a4).get(i4)).get(i3$2);
    var suffix2$2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$5, i2$3), 2);
    var a$6 = $n($n($n(this.sci_VectorBuilder__f_a4).get(i4)).get(i3$2)).get(i2$3);
    var len$3 = ((1 + i1$3) | 0);
    var suffix1$3 = (($n(a$6).u.length === len$3) ? a$6 : $m_ju_Arrays$().copyOf__AO__I__AO(a$6, len$3));
    var len1$2 = $n(prefix1$3).u.length;
    var len12$2 = ((len1$2 + ($n(prefix2$2).u.length << 5)) | 0);
    var len123 = ((len12$2 + ($n(prefix3).u.length << 10)) | 0);
    return new $c_sci_Vector4(prefix1$3, len1$2, prefix2$2, len12$2, prefix3, len123, data$3, suffix3, suffix2$2, suffix1$3, realLen);
  } else if ((len <= 33554432)) {
    var i1$4 = (31 & ((len - 1) | 0));
    var i2$4 = (31 & ((((len - 1) | 0) >>> 5) | 0));
    var i3$3 = (31 & ((((len - 1) | 0) >>> 10) | 0));
    var i4$2 = (31 & ((((len - 1) | 0) >>> 15) | 0));
    var i5 = ((((len - 1) | 0) >>> 20) | 0);
    var original$6 = this.sci_VectorBuilder__f_a5;
    var data$4 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$6, 1, i5), 5);
    var a$7 = $n(this.sci_VectorBuilder__f_a5).get(0);
    var to$3 = $n(a$7).u.length;
    var prefix4 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$7, 1, to$3), 4);
    var a$8 = $n($n(this.sci_VectorBuilder__f_a5).get(0)).get(0);
    var to$4 = $n(a$8).u.length;
    var prefix3$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$8, 1, to$4), 3);
    var a$9 = $n($n($n(this.sci_VectorBuilder__f_a5).get(0)).get(0)).get(0);
    var to$5 = $n(a$9).u.length;
    var prefix2$3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$9, 1, to$5), 2);
    var prefix1$4 = $n($n($n($n(this.sci_VectorBuilder__f_a5).get(0)).get(0)).get(0)).get(0);
    var original$7 = $n(this.sci_VectorBuilder__f_a5).get(i5);
    var suffix4 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$7, i4$2), 4);
    var original$8 = $n($n(this.sci_VectorBuilder__f_a5).get(i5)).get(i4$2);
    var suffix3$2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$8, i3$3), 3);
    var original$9 = $n($n($n(this.sci_VectorBuilder__f_a5).get(i5)).get(i4$2)).get(i3$3);
    var suffix2$3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$9, i2$4), 2);
    var a$10 = $n($n($n($n(this.sci_VectorBuilder__f_a5).get(i5)).get(i4$2)).get(i3$3)).get(i2$4);
    var len$4 = ((1 + i1$4) | 0);
    var suffix1$4 = (($n(a$10).u.length === len$4) ? a$10 : $m_ju_Arrays$().copyOf__AO__I__AO(a$10, len$4));
    var len1$3 = $n(prefix1$4).u.length;
    var len12$3 = ((len1$3 + ($n(prefix2$3).u.length << 5)) | 0);
    var len123$2 = ((len12$3 + ($n(prefix3$2).u.length << 10)) | 0);
    var len1234 = ((len123$2 + ($n(prefix4).u.length << 15)) | 0);
    return new $c_sci_Vector5(prefix1$4, len1$3, prefix2$3, len12$3, prefix3$2, len123$2, prefix4, len1234, data$4, suffix4, suffix3$2, suffix2$3, suffix1$4, realLen);
  } else {
    var i1$5 = (31 & ((len - 1) | 0));
    var i2$5 = (31 & ((((len - 1) | 0) >>> 5) | 0));
    var i3$4 = (31 & ((((len - 1) | 0) >>> 10) | 0));
    var i4$3 = (31 & ((((len - 1) | 0) >>> 15) | 0));
    var i5$2 = (31 & ((((len - 1) | 0) >>> 20) | 0));
    var i6 = ((((len - 1) | 0) >>> 25) | 0);
    var original$10 = this.sci_VectorBuilder__f_a6;
    var data$5 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(original$10, 1, i6), 6);
    var a$11 = $n(this.sci_VectorBuilder__f_a6).get(0);
    var to$6 = $n(a$11).u.length;
    var prefix5 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$11, 1, to$6), 5);
    var a$12 = $n($n(this.sci_VectorBuilder__f_a6).get(0)).get(0);
    var to$7 = $n(a$12).u.length;
    var prefix4$2 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$12, 1, to$7), 4);
    var a$13 = $n($n($n(this.sci_VectorBuilder__f_a6).get(0)).get(0)).get(0);
    var to$8 = $n(a$13).u.length;
    var prefix3$3 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$13, 1, to$8), 3);
    var a$14 = $n($n($n($n(this.sci_VectorBuilder__f_a6).get(0)).get(0)).get(0)).get(0);
    var to$9 = $n(a$14).u.length;
    var prefix2$4 = $asArrayOf_O($m_ju_Arrays$().copyOfRange__AO__I__I__AO(a$14, 1, to$9), 2);
    var prefix1$5 = $n($n($n($n($n(this.sci_VectorBuilder__f_a6).get(0)).get(0)).get(0)).get(0)).get(0);
    var original$11 = $n(this.sci_VectorBuilder__f_a6).get(i6);
    var suffix5 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$11, i5$2), 5);
    var original$12 = $n($n(this.sci_VectorBuilder__f_a6).get(i6)).get(i5$2);
    var suffix4$2 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$12, i4$3), 4);
    var original$13 = $n($n($n(this.sci_VectorBuilder__f_a6).get(i6)).get(i5$2)).get(i4$3);
    var suffix3$3 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$13, i3$4), 3);
    var original$14 = $n($n($n($n(this.sci_VectorBuilder__f_a6).get(i6)).get(i5$2)).get(i4$3)).get(i3$4);
    var suffix2$4 = $asArrayOf_O($m_ju_Arrays$().copyOf__AO__I__AO(original$14, i2$5), 2);
    var a$15 = $n($n($n($n($n(this.sci_VectorBuilder__f_a6).get(i6)).get(i5$2)).get(i4$3)).get(i3$4)).get(i2$5);
    var len$5 = ((1 + i1$5) | 0);
    var suffix1$5 = (($n(a$15).u.length === len$5) ? a$15 : $m_ju_Arrays$().copyOf__AO__I__AO(a$15, len$5));
    var len1$4 = $n(prefix1$5).u.length;
    var len12$4 = ((len1$4 + ($n(prefix2$4).u.length << 5)) | 0);
    var len123$3 = ((len12$4 + ($n(prefix3$3).u.length << 10)) | 0);
    var len1234$2 = ((len123$3 + ($n(prefix4$2).u.length << 15)) | 0);
    var len12345 = ((len1234$2 + ($n(prefix5).u.length << 20)) | 0);
    return new $c_sci_Vector6(prefix1$5, len1$4, prefix2$4, len12$4, prefix3$3, len123$3, prefix4$2, len1234$2, prefix5, len12345, data$5, suffix5, suffix4$2, suffix3$3, suffix2$4, suffix1$5, realLen);
  }
});
$c_sci_VectorBuilder.prototype.toString__T = (function() {
  return (((((((("VectorBuilder(len1=" + this.sci_VectorBuilder__f_len1) + ", lenRest=") + this.sci_VectorBuilder__f_lenRest) + ", offset=") + this.sci_VectorBuilder__f_offset) + ", depth=") + this.sci_VectorBuilder__f_depth) + ")");
});
$c_sci_VectorBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__sci_VectorBuilder(elem);
});
$c_sci_VectorBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(elems) {
  return this.addAll__sc_IterableOnce__sci_VectorBuilder(elems);
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector();
});
function $as_sci_VectorBuilder(obj) {
  return (((obj instanceof $c_sci_VectorBuilder) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"));
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)));
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth));
}
var $d_sci_VectorBuilder = new $TypeData().initClass($c_sci_VectorBuilder, "scala.collection.immutable.VectorBuilder", ({
  sci_VectorBuilder: 1,
  scm_Clearable: 1,
  scm_Growable: 1,
  scm_Builder: 1,
  scm_ReusableBuilder: 1
}));
/** @constructor */
function $c_scm_ArrayBuffer$() {
  this.scm_ArrayBuffer$__f_emptyArray = null;
  $n_scm_ArrayBuffer$ = this;
  this.scm_ArrayBuffer$__f_emptyArray = new $ac_O(0);
}
$c_scm_ArrayBuffer$.prototype = new $h_O();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.from__sc_IterableOnce__scm_ArrayBuffer = (function(coll) {
  var k = $n(coll).knownSize__I();
  if ((k >= 0)) {
    var array = this.scala$collection$mutable$ArrayBuffer$$$ensureSize__AO__I__I__AO(this.scm_ArrayBuffer$__f_emptyArray, 0, k);
    if ($is_sc_Iterable(coll)) {
      var src = $as_sc_Iterable(coll);
      var actual = $n(src).copyToArray__O__I__I__I(array, 0, 2147483647);
    } else {
      var actual = $n($n(coll).iterator__sc_Iterator()).copyToArray__O__I__I__I(array, 0, 2147483647);
    }
    if ((actual !== k)) {
      throw new $c_jl_IllegalStateException(((("Copied " + actual) + " of ") + k));
    }
    return $ct_scm_ArrayBuffer__AO__I__(new $c_scm_ArrayBuffer(), array, k);
  } else {
    var this$2 = $ct_scm_ArrayBuffer__(new $c_scm_ArrayBuffer());
    return this$2.addAll__sc_IterableOnce__scm_ArrayBuffer(coll);
  }
});
$c_scm_ArrayBuffer$.prototype.resizeUp__I__I__I = (function(arrayLen, targetLen) {
  if ((targetLen < 0)) {
    throw $ct_jl_RuntimeException__T__(new $c_jl_RuntimeException(), ((((("Overflow while resizing array of array-backed collection. Requested length: " + targetLen) + "; current length: ") + arrayLen) + "; increase: ") + ((targetLen - arrayLen) | 0)));
  } else if ((targetLen <= arrayLen)) {
    return (-1);
  } else {
    if ((targetLen > 2147483639)) {
      throw $ct_jl_RuntimeException__T__(new $c_jl_RuntimeException(), ((("Array of array-backed collection exceeds VM length limit of 2147483639. Requested length: " + targetLen) + "; current length: ") + arrayLen));
    }
    if ((arrayLen > 1073741819)) {
      return 2147483639;
    } else {
      var x = (arrayLen << 1);
      var y = ((x > 16) ? x : 16);
      return ((targetLen > y) ? targetLen : y);
    }
  }
});
$c_scm_ArrayBuffer$.prototype.scala$collection$mutable$ArrayBuffer$$$ensureSize__AO__I__I__AO = (function(array, curSize, targetSize) {
  var newLen = this.resizeUp__I__I__I($n(array).u.length, targetSize);
  if ((newLen < 0)) {
    return array;
  } else {
    var res = new $ac_O(newLen);
    $systemArraycopyRefs($n(array), 0, res, 0, curSize);
    return res;
  }
});
$c_scm_ArrayBuffer$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__scm_ArrayBuffer(source);
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass($c_scm_ArrayBuffer$, "scala.collection.mutable.ArrayBuffer$", ({
  scm_ArrayBuffer$: 1,
  Ljava_io_Serializable: 1,
  sc_IterableFactory: 1,
  sc_SeqFactory: 1,
  sc_StrictOptimizedSeqFactory: 1
}));
var $n_scm_ArrayBuffer$;
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$();
  }
  return $n_scm_ArrayBuffer$;
}
/** @constructor */
function $c_scm_Buffer$() {
  this.sc_SeqFactory$Delegate__f_delegate = null;
  $ct_sc_SeqFactory$Delegate__sc_SeqFactory__(this, $m_sjs_js_WrappedArray$());
}
$c_scm_Buffer$.prototype = new $h_sc_SeqFactory$Delegate();
$c_scm_Buffer$.prototype.constructor = $c_scm_Buffer$;
/** @constructor */
function $h_scm_Buffer$() {
}
$h_scm_Buffer$.prototype = $c_scm_Buffer$.prototype;
var $d_scm_Buffer$ = new $TypeData().initClass($c_scm_Buffer$, "scala.collection.mutable.Buffer$", ({
  scm_Buffer$: 1,
  sc_SeqFactory$Delegate: 1,
  Ljava_io_Serializable: 1,
  sc_IterableFactory: 1,
  sc_SeqFactory: 1
}));
var $n_scm_Buffer$;
function $m_scm_Buffer$() {
  if ((!$n_scm_Buffer$)) {
    $n_scm_Buffer$ = new $c_scm_Buffer$();
  }
  return $n_scm_Buffer$;
}
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1(x$1) {
  this.sr_ScalaRunTime$$anon$1__f_x$2 = null;
  this.sr_ScalaRunTime$$anon$1__f_c = 0;
  this.sr_ScalaRunTime$$anon$1__f_cmax = 0;
  this.sr_ScalaRunTime$$anon$1__f_x$2 = x$1;
  this.sr_ScalaRunTime$$anon$1__f_c = 0;
  this.sr_ScalaRunTime$$anon$1__f_cmax = $n(x$1).productArity__I();
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.sr_ScalaRunTime$$anon$1__f_c < this.sr_ScalaRunTime$$anon$1__f_cmax);
});
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = $n(this.sr_ScalaRunTime$$anon$1__f_x$2).productElement__I__O(this.sr_ScalaRunTime$$anon$1__f_c);
  this.sr_ScalaRunTime$$anon$1__f_c = ((1 + this.sr_ScalaRunTime$$anon$1__f_c) | 0);
  return result;
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass($c_sr_ScalaRunTime$$anon$1, "scala.runtime.ScalaRunTime$$anon$1", ({
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sjs_js_WrappedArray$() {
}
$c_sjs_js_WrappedArray$.prototype = new $h_O();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.from__sc_IterableOnce__sjs_js_WrappedArray = (function(source) {
  var this$1 = $ct_sjs_js_WrappedArray__(new $c_sjs_js_WrappedArray());
  return $as_sjs_js_WrappedArray($n($as_scm_Builder($f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this$1, source))).result__O());
});
$c_sjs_js_WrappedArray$.prototype.from__sc_IterableOnce__O = (function(source) {
  return this.from__sc_IterableOnce__sjs_js_WrappedArray(source);
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass($c_sjs_js_WrappedArray$, "scala.scalajs.js.WrappedArray$", ({
  sjs_js_WrappedArray$: 1,
  sc_StrictOptimizedSeqFactory: 1,
  Ljava_io_Serializable: 1,
  sc_IterableFactory: 1,
  sc_SeqFactory: 1
}));
var $n_sjs_js_WrappedArray$;
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$();
  }
  return $n_sjs_js_WrappedArray$;
}
function $ct_jl_ArrayIndexOutOfBoundsException__T__($thiz, s) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, s, null, true, true);
  return $thiz;
}
function $ct_jl_ArrayIndexOutOfBoundsException__($thiz) {
  $ct_jl_Throwable__T__jl_Throwable__Z__Z__($thiz, null, null, true, true);
  return $thiz;
}
class $c_jl_ArrayIndexOutOfBoundsException extends $c_jl_IndexOutOfBoundsException {
}
var $d_jl_ArrayIndexOutOfBoundsException = new $TypeData().initClass($c_jl_ArrayIndexOutOfBoundsException, "java.lang.ArrayIndexOutOfBoundsException", ({
  jl_ArrayIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $f_jl_Double__equals__O__Z($thiz, that) {
  return Object.is($thiz, that);
}
function $f_jl_Double__hashCode__I($thiz) {
  var valueInt = ($thiz | 0);
  if (((valueInt === $thiz) && ((1.0 / $thiz) !== (-Infinity)))) {
    return valueInt;
  } else if (($thiz !== $thiz)) {
    return 2146959360;
  } else {
    var fpBitsDataView = $fpBitsDataView;
    fpBitsDataView.setFloat64(0, $thiz, true);
    var lo = $uI(fpBitsDataView.getInt32(0, true));
    var hi = $uI(fpBitsDataView.getInt32(4, true));
    return (lo ^ hi);
  }
}
function $f_jl_Double__toString__T($thiz) {
  return ("" + $thiz);
}
function $as_jl_Double(obj) {
  return ((((typeof obj) === "number") || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Double"));
}
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)));
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth));
}
var $d_jl_Double = new $TypeData().initClass(0, "java.lang.Double", ({
  jl_Double: 1,
  jl_Number: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1,
  jl_constant_ConstantDesc: 1
}), ((x) => ((typeof x) === "number")));
function $f_jl_Float__equals__O__Z($thiz, that) {
  return Object.is($thiz, that);
}
function $f_jl_Float__hashCode__I($thiz) {
  var value = $thiz;
  var valueInt = (value | 0);
  if (((valueInt === value) && ((1.0 / value) !== (-Infinity)))) {
    return valueInt;
  } else if ((value !== value)) {
    return 2146959360;
  } else {
    var fpBitsDataView = $fpBitsDataView;
    fpBitsDataView.setFloat64(0, value, true);
    var lo = $uI(fpBitsDataView.getInt32(0, true));
    var hi = $uI(fpBitsDataView.getInt32(4, true));
    return (lo ^ hi);
  }
}
function $f_jl_Float__toString__T($thiz) {
  return ("" + $thiz);
}
var $d_jl_Float = new $TypeData().initClass(0, "java.lang.Float", ({
  jl_Float: 1,
  jl_Number: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1,
  jl_constant_ConstantDesc: 1
}), ((x) => $isFloat(x)));
function $f_jl_Integer__equals__O__Z($thiz, that) {
  return Object.is($thiz, that);
}
function $f_jl_Integer__hashCode__I($thiz) {
  return $thiz;
}
function $f_jl_Integer__toString__T($thiz) {
  return ("" + $thiz);
}
var $d_jl_Integer = new $TypeData().initClass(0, "java.lang.Integer", ({
  jl_Integer: 1,
  jl_Number: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1,
  jl_constant_ConstantDesc: 1
}), ((x) => $isInt(x)));
function $f_jl_Long__equals__O__Z($thiz, $thizhi, that) {
  if ((that instanceof $Long)) {
    var x2 = $as_jl_Long(that);
    var $x_1 = $n(x2);
    var this$1_$_lo = $x_1.l;
    var this$1_$_hi = $x_1.h;
    return ((($thiz ^ this$1_$_lo) | ($thizhi ^ this$1_$_hi)) === 0);
  } else {
    return false;
  }
}
function $f_jl_Long__hashCode__I($thiz, $thizhi) {
  return ($thiz ^ $thizhi);
}
function $f_jl_Long__toString__T($thiz, $thizhi) {
  return $m_RTLong$().toString__I__I__T($thiz, $thizhi);
}
function $as_jl_Long(obj) {
  return (((obj instanceof $Long) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Long"));
}
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)));
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth));
}
var $d_jl_Long = new $TypeData().initClass(0, "java.lang.Long", ({
  jl_Long: 1,
  jl_Number: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_constant_Constable: 1,
  jl_constant_ConstantDesc: 1
}), ((x) => (x instanceof $Long)));
class $c_jl_NumberFormatException extends $c_jl_IllegalArgumentException {
  constructor(s) {
    super();
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_jl_NumberFormatException = new $TypeData().initClass($c_jl_NumberFormatException, "java.lang.NumberFormatException", ({
  jl_NumberFormatException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
function $f_T__hashCode__I($thiz) {
  var n = $thiz.length;
  var h = 0;
  var i = 0;
  while ((i !== n)) {
    var $x_2 = h;
    var $x_1 = h;
    var index = i;
    h = ((((($x_2 << 5) - $x_1) | 0) + $charAt($thiz, index)) | 0);
    i = ((1 + i) | 0);
  }
  return h;
}
function $f_T__equals__O__Z($thiz, that) {
  return ($thiz === that);
}
function $f_T__toString__T($thiz) {
  return $thiz;
}
function $as_T(obj) {
  return ((((typeof obj) === "string") || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"));
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)));
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth));
}
var $d_T = new $TypeData().initClass(0, "java.lang.String", ({
  T: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1,
  jl_CharSequence: 1,
  jl_constant_Constable: 1,
  jl_constant_ConstantDesc: 1
}), ((x) => ((typeof x) === "string")));
class $c_jl_StringIndexOutOfBoundsException extends $c_jl_IndexOutOfBoundsException {
  constructor(index) {
    super();
    var s = ("String index out of range: " + index);
    $ct_jl_Throwable__T__jl_Throwable__Z__Z__(this, s, null, true, true);
  }
}
var $d_jl_StringIndexOutOfBoundsException = new $TypeData().initClass($c_jl_StringIndexOutOfBoundsException, "java.lang.StringIndexOutOfBoundsException", ({
  jl_StringIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_s_None$() {
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880;
});
$c_s_None$.prototype.toString__T = (function() {
  return "None";
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0;
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None";
});
$c_s_None$.prototype.productElement__I__O = (function(n) {
  throw $ct_jl_IndexOutOfBoundsException__I__(new $c_jl_IndexOutOfBoundsException(), n);
});
$c_s_None$.prototype.get__E = (function() {
  throw new $c_ju_NoSuchElementException("None.get");
});
$c_s_None$.prototype.get__O = (function() {
  this.get__E();
});
var $d_s_None$ = new $TypeData().initClass($c_s_None$, "scala.None$", ({
  s_None$: 1,
  s_Option: 1,
  sc_IterableOnce: 1,
  s_Equals: 1,
  s_Product: 1,
  Ljava_io_Serializable: 1
}));
var $n_s_None$;
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$();
  }
  return $n_s_None$;
}
/** @constructor */
function $c_s_Some(value) {
  this.s_Some__f_value = null;
  this.s_Some__f_value = value;
}
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
function $h_s_Some() {
}
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().productHash__s_Product__I__Z__I(this, 1323286827, true);
});
$c_s_Some.prototype.equals__O__Z = (function(x$0) {
  if ((this === x$0)) {
    return true;
  } else if ((x$0 instanceof $c_s_Some)) {
    var x$0$2 = $as_s_Some(x$0);
    var x = this.s_Some__f_value;
    var y = $n(x$0$2).s_Some__f_value;
    return $m_sr_BoxesRunTime$().equals__O__O__Z(x, y);
  } else {
    return false;
  }
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$()._toString__s_Product__T(this);
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1;
});
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some";
});
$c_s_Some.prototype.productElement__I__O = (function(n) {
  if ((n === 0)) {
    return this.s_Some__f_value;
  }
  throw $ct_jl_IndexOutOfBoundsException__I__(new $c_jl_IndexOutOfBoundsException(), n);
});
$c_s_Some.prototype.get__O = (function() {
  return this.s_Some__f_value;
});
function $as_s_Some(obj) {
  return (((obj instanceof $c_s_Some) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"));
}
function $isArrayOf_s_Some(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)));
}
function $asArrayOf_s_Some(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth));
}
var $d_s_Some = new $TypeData().initClass($c_s_Some, "scala.Some", ({
  s_Some: 1,
  s_Option: 1,
  sc_IterableOnce: 1,
  s_Equals: 1,
  s_Product: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sc_AbstractIterable() {
}
$c_sc_AbstractIterable.prototype = new $h_O();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.knownSize__I = (function() {
  return (-1);
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f);
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  return $f_sc_IterableOnceOps__forall__F1__Z(this, p);
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__I = (function(dest, start, n) {
  return $f_sc_IterableOnceOps__copyToArray__O__I__I__I(this, dest, start, n);
});
$c_sc_AbstractIterable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end);
});
$c_sc_AbstractIterable.prototype.className__T = (function() {
  return this.stringPrefix__T();
});
/** @constructor */
function $c_sc_ArrayOps$ArrayIterator(xs) {
  this.sc_ArrayOps$ArrayIterator__f_xs = null;
  this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos = 0;
  this.sc_ArrayOps$ArrayIterator__f_len = 0;
  this.sc_ArrayOps$ArrayIterator__f_xs = xs;
  this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos = 0;
  var xs$1 = this.sc_ArrayOps$ArrayIterator__f_xs;
  this.sc_ArrayOps$ArrayIterator__f_len = $m_jl_reflect_Array$().getLength__O__I(xs$1);
}
$c_sc_ArrayOps$ArrayIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_ArrayOps$ArrayIterator.prototype.constructor = $c_sc_ArrayOps$ArrayIterator;
/** @constructor */
function $h_sc_ArrayOps$ArrayIterator() {
}
$h_sc_ArrayOps$ArrayIterator.prototype = $c_sc_ArrayOps$ArrayIterator.prototype;
$c_sc_ArrayOps$ArrayIterator.prototype.knownSize__I = (function() {
  return ((this.sc_ArrayOps$ArrayIterator__f_len - this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos) | 0);
});
$c_sc_ArrayOps$ArrayIterator.prototype.hasNext__Z = (function() {
  return (this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos < this.sc_ArrayOps$ArrayIterator__f_len);
});
$c_sc_ArrayOps$ArrayIterator.prototype.next__O = (function() {
  var $x_1 = this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos;
  var xs = this.sc_ArrayOps$ArrayIterator__f_xs;
  if (($x_1 >= $m_jl_reflect_Array$().getLength__O__I(xs))) {
    $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
  var r = $m_sr_ScalaRunTime$().array_apply__O__I__O(this.sc_ArrayOps$ArrayIterator__f_xs, this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos);
  this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos = ((1 + this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos) | 0);
  return r;
});
$c_sc_ArrayOps$ArrayIterator.prototype.drop__I__sc_Iterator = (function(n) {
  if ((n > 0)) {
    var newPos = ((this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos + n) | 0);
    if ((newPos < 0)) {
      var $x_1 = this.sc_ArrayOps$ArrayIterator__f_len;
    } else {
      var a = this.sc_ArrayOps$ArrayIterator__f_len;
      var $x_1 = ((a < newPos) ? a : newPos);
    }
    this.sc_ArrayOps$ArrayIterator__f_scala$collection$ArrayOps$ArrayIterator$$pos = $x_1;
  }
  return this;
});
var $d_sc_ArrayOps$ArrayIterator = new $TypeData().initClass($c_sc_ArrayOps$ArrayIterator, "scala.collection.ArrayOps$ArrayIterator", ({
  sc_ArrayOps$ArrayIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1,
  Ljava_io_Serializable: 1
}));
function $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__($thiz, self) {
  $thiz.sc_IndexedSeqView$IndexedSeqViewIterator__f_self = self;
  $thiz.sc_IndexedSeqView$IndexedSeqViewIterator__f_current = 0;
  $thiz.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder = $n(self).length__I();
  return $thiz;
}
function $p_sc_IndexedSeqView$IndexedSeqViewIterator__formatRange$1__I__I($thiz, value) {
  return ((value < 0) ? 0 : ((value > $thiz.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder) ? $thiz.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder : value));
}
/** @constructor */
function $c_sc_IndexedSeqView$IndexedSeqViewIterator() {
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_self = null;
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current = 0;
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder = 0;
}
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.constructor = $c_sc_IndexedSeqView$IndexedSeqViewIterator;
/** @constructor */
function $h_sc_IndexedSeqView$IndexedSeqViewIterator() {
}
$h_sc_IndexedSeqView$IndexedSeqViewIterator.prototype = $c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype;
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.knownSize__I = (function() {
  return this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder;
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.hasNext__Z = (function() {
  return (this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder > 0);
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.next__O = (function() {
  if ((this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder > 0)) {
    var r = $n(this.sc_IndexedSeqView$IndexedSeqViewIterator__f_self).apply__I__O(this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current);
    this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current = ((1 + this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current) | 0);
    this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder = ((this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder - 1) | 0);
    return r;
  } else {
    return $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.drop__I__sc_Iterator = (function(n) {
  if ((n > 0)) {
    this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current = ((this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current + n) | 0);
    var b = ((this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder - n) | 0);
    this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder = ((b < 0) ? 0 : b);
  }
  return this;
});
$c_sc_IndexedSeqView$IndexedSeqViewIterator.prototype.sliceIterator__I__I__sc_Iterator = (function(from, until) {
  var formatFrom = $p_sc_IndexedSeqView$IndexedSeqViewIterator__formatRange$1__I__I(this, from);
  var formatUntil = $p_sc_IndexedSeqView$IndexedSeqViewIterator__formatRange$1__I__I(this, until);
  var b = ((formatUntil - formatFrom) | 0);
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder = ((b < 0) ? 0 : b);
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current = ((this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current + formatFrom) | 0);
  return this;
});
var $d_sc_IndexedSeqView$IndexedSeqViewIterator = new $TypeData().initClass($c_sc_IndexedSeqView$IndexedSeqViewIterator, "scala.collection.IndexedSeqView$IndexedSeqViewIterator", ({
  sc_IndexedSeqView$IndexedSeqViewIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1,
  Ljava_io_Serializable: 1
}));
function $f_sc_MapOps__foreachEntry__F2__V($thiz, f) {
  var it = $thiz.iterator__sc_Iterator();
  while ($n(it).hasNext__Z()) {
    var next = $as_T2($n(it).next__O());
    $n(f).apply__O__O__O($n(next)._1__O(), $n(next)._2__O());
  }
}
function $f_sc_MapOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, sb, start, sep, end) {
  var this$2 = $n($thiz.iterator__sc_Iterator());
  var f = new $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(((x$1$2) => {
    var x$1 = $as_T2(x$1$2);
    var k = $n(x$1)._1__O();
    var v = $n(x$1)._2__O();
    return ((k + " -> ") + v);
  }));
  var this$3 = new $c_sc_Iterator$$anon$9(f, this$2);
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$3, sb, start, sep, end);
}
/** @constructor */
function $c_sci_HashMapBuilder$$anon$1(hm$1, outer) {
  this.sci_ChampBaseIterator__f_currentValueCursor = 0;
  this.sci_ChampBaseIterator__f_currentValueLength = 0;
  this.sci_ChampBaseIterator__f_currentValueNode = null;
  this.sci_ChampBaseIterator__f_currentStackLevel = 0;
  this.sci_ChampBaseIterator__f_nodeCursorsAndLengths = null;
  this.sci_ChampBaseIterator__f_nodes = null;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $ct_sci_ChampBaseIterator__sci_Node__(this, $n(hm$1).sci_HashMap__f_rootNode);
  while (this.hasNext__Z()) {
    var originalHash = $n(this.sci_ChampBaseIterator__f_currentValueNode).getHash__I__I(this.sci_ChampBaseIterator__f_currentValueCursor);
    $n(outer).update__sci_MapNode__O__O__I__I__I__V($n(outer).sci_HashMapBuilder__f_scala$collection$immutable$HashMapBuilder$$rootNode, $n($as_sci_MapNode(this.sci_ChampBaseIterator__f_currentValueNode)).getKey__I__O(this.sci_ChampBaseIterator__f_currentValueCursor), $n($as_sci_MapNode(this.sci_ChampBaseIterator__f_currentValueNode)).getValue__I__O(this.sci_ChampBaseIterator__f_currentValueCursor), originalHash, $m_sc_Hashing$().improve__I__I(originalHash), 0);
    this.sci_ChampBaseIterator__f_currentValueCursor = ((1 + this.sci_ChampBaseIterator__f_currentValueCursor) | 0);
  }
}
$c_sci_HashMapBuilder$$anon$1.prototype = new $h_sci_ChampBaseIterator();
$c_sci_HashMapBuilder$$anon$1.prototype.constructor = $c_sci_HashMapBuilder$$anon$1;
/** @constructor */
function $h_sci_HashMapBuilder$$anon$1() {
}
$h_sci_HashMapBuilder$$anon$1.prototype = $c_sci_HashMapBuilder$$anon$1.prototype;
$c_sci_HashMapBuilder$$anon$1.prototype.next__O = (function() {
  return $as_T2($n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O());
});
var $d_sci_HashMapBuilder$$anon$1 = new $TypeData().initClass($c_sci_HashMapBuilder$$anon$1, "scala.collection.immutable.HashMapBuilder$$anon$1", ({
  sci_HashMapBuilder$$anon$1: 1,
  sci_ChampBaseIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)));
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"));
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)));
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth));
}
/** @constructor */
function $c_sci_Map$Map2$$anon$1(outer) {
  this.sci_Map$Map2$Map2Iterator__f_i = 0;
  this.sci_Map$Map2$Map2Iterator__f_$outer = null;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $ct_sci_Map$Map2$Map2Iterator__sci_Map$Map2__(this, outer);
}
$c_sci_Map$Map2$$anon$1.prototype = new $h_sci_Map$Map2$Map2Iterator();
$c_sci_Map$Map2$$anon$1.prototype.constructor = $c_sci_Map$Map2$$anon$1;
/** @constructor */
function $h_sci_Map$Map2$$anon$1() {
}
$h_sci_Map$Map2$$anon$1.prototype = $c_sci_Map$Map2$$anon$1.prototype;
var $d_sci_Map$Map2$$anon$1 = new $TypeData().initClass($c_sci_Map$Map2$$anon$1, "scala.collection.immutable.Map$Map2$$anon$1", ({
  sci_Map$Map2$$anon$1: 1,
  sci_Map$Map2$Map2Iterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sci_Map$Map3$$anon$4(outer) {
  this.sci_Map$Map3$Map3Iterator__f_i = 0;
  this.sci_Map$Map3$Map3Iterator__f_$outer = null;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $ct_sci_Map$Map3$Map3Iterator__sci_Map$Map3__(this, outer);
}
$c_sci_Map$Map3$$anon$4.prototype = new $h_sci_Map$Map3$Map3Iterator();
$c_sci_Map$Map3$$anon$4.prototype.constructor = $c_sci_Map$Map3$$anon$4;
/** @constructor */
function $h_sci_Map$Map3$$anon$4() {
}
$h_sci_Map$Map3$$anon$4.prototype = $c_sci_Map$Map3$$anon$4.prototype;
var $d_sci_Map$Map3$$anon$4 = new $TypeData().initClass($c_sci_Map$Map3$$anon$4, "scala.collection.immutable.Map$Map3$$anon$4", ({
  sci_Map$Map3$$anon$4: 1,
  sci_Map$Map3$Map3Iterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sci_Map$Map4$$anon$7(outer) {
  this.sci_Map$Map4$Map4Iterator__f_i = 0;
  this.sci_Map$Map4$Map4Iterator__f_$outer = null;
  if ((outer === null)) {
    throw $ct_jl_NullPointerException__(new $c_jl_NullPointerException());
  }
  $ct_sci_Map$Map4$Map4Iterator__sci_Map$Map4__(this, outer);
}
$c_sci_Map$Map4$$anon$7.prototype = new $h_sci_Map$Map4$Map4Iterator();
$c_sci_Map$Map4$$anon$7.prototype.constructor = $c_sci_Map$Map4$$anon$7;
/** @constructor */
function $h_sci_Map$Map4$$anon$7() {
}
$h_sci_Map$Map4$$anon$7.prototype = $c_sci_Map$Map4$$anon$7.prototype;
var $d_sci_Map$Map4$$anon$7 = new $TypeData().initClass($c_sci_Map$Map4$$anon$7, "scala.collection.immutable.Map$Map4$$anon$7", ({
  sci_Map$Map4$$anon$7: 1,
  sci_Map$Map4$Map4Iterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sci_MapKeyValueTupleHashIterator(rootNode) {
  this.sci_ChampBaseReverseIterator__f_currentValueCursor = 0;
  this.sci_ChampBaseReverseIterator__f_currentValueNode = null;
  this.sci_ChampBaseReverseIterator__f_currentStackLevel = 0;
  this.sci_ChampBaseReverseIterator__f_nodeIndex = null;
  this.sci_ChampBaseReverseIterator__f_nodeStack = null;
  this.sci_MapKeyValueTupleHashIterator__f_hash = 0;
  this.sci_MapKeyValueTupleHashIterator__f_value = null;
  $ct_sci_ChampBaseReverseIterator__sci_Node__(this, rootNode);
  this.sci_MapKeyValueTupleHashIterator__f_hash = 0;
}
$c_sci_MapKeyValueTupleHashIterator.prototype = new $h_sci_ChampBaseReverseIterator();
$c_sci_MapKeyValueTupleHashIterator.prototype.constructor = $c_sci_MapKeyValueTupleHashIterator;
/** @constructor */
function $h_sci_MapKeyValueTupleHashIterator() {
}
$h_sci_MapKeyValueTupleHashIterator.prototype = $c_sci_MapKeyValueTupleHashIterator.prototype;
$c_sci_MapKeyValueTupleHashIterator.prototype.hashCode__I = (function() {
  var $x_2 = $m_s_util_hashing_MurmurHash3$();
  var $x_1 = this.sci_MapKeyValueTupleHashIterator__f_hash;
  var x = this.sci_MapKeyValueTupleHashIterator__f_value;
  return $x_2.tuple2Hash__I__I__I__I($x_1, $m_sr_Statics$().anyHash__O__I(x), (-889275714));
});
$c_sci_MapKeyValueTupleHashIterator.prototype.next__sci_MapKeyValueTupleHashIterator = (function() {
  if ((!this.hasNext__Z())) {
    $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
  this.sci_MapKeyValueTupleHashIterator__f_hash = $n(this.sci_ChampBaseReverseIterator__f_currentValueNode).getHash__I__I(this.sci_ChampBaseReverseIterator__f_currentValueCursor);
  this.sci_MapKeyValueTupleHashIterator__f_value = $n($as_sci_MapNode(this.sci_ChampBaseReverseIterator__f_currentValueNode)).getValue__I__O(this.sci_ChampBaseReverseIterator__f_currentValueCursor);
  this.sci_ChampBaseReverseIterator__f_currentValueCursor = ((this.sci_ChampBaseReverseIterator__f_currentValueCursor - 1) | 0);
  return this;
});
$c_sci_MapKeyValueTupleHashIterator.prototype.next__O = (function() {
  return this.next__sci_MapKeyValueTupleHashIterator();
});
var $d_sci_MapKeyValueTupleHashIterator = new $TypeData().initClass($c_sci_MapKeyValueTupleHashIterator, "scala.collection.immutable.MapKeyValueTupleHashIterator", ({
  sci_MapKeyValueTupleHashIterator: 1,
  sci_ChampBaseReverseIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
/** @constructor */
function $c_sci_MapKeyValueTupleIterator(rootNode) {
  this.sci_ChampBaseIterator__f_currentValueCursor = 0;
  this.sci_ChampBaseIterator__f_currentValueLength = 0;
  this.sci_ChampBaseIterator__f_currentValueNode = null;
  this.sci_ChampBaseIterator__f_currentStackLevel = 0;
  this.sci_ChampBaseIterator__f_nodeCursorsAndLengths = null;
  this.sci_ChampBaseIterator__f_nodes = null;
  $ct_sci_ChampBaseIterator__sci_Node__(this, rootNode);
}
$c_sci_MapKeyValueTupleIterator.prototype = new $h_sci_ChampBaseIterator();
$c_sci_MapKeyValueTupleIterator.prototype.constructor = $c_sci_MapKeyValueTupleIterator;
/** @constructor */
function $h_sci_MapKeyValueTupleIterator() {
}
$h_sci_MapKeyValueTupleIterator.prototype = $c_sci_MapKeyValueTupleIterator.prototype;
$c_sci_MapKeyValueTupleIterator.prototype.next__T2 = (function() {
  if ((!this.hasNext__Z())) {
    $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
  var payload = $n($as_sci_MapNode(this.sci_ChampBaseIterator__f_currentValueNode)).getPayload__I__T2(this.sci_ChampBaseIterator__f_currentValueCursor);
  this.sci_ChampBaseIterator__f_currentValueCursor = ((1 + this.sci_ChampBaseIterator__f_currentValueCursor) | 0);
  return payload;
});
$c_sci_MapKeyValueTupleIterator.prototype.next__O = (function() {
  return this.next__T2();
});
var $d_sci_MapKeyValueTupleIterator = new $TypeData().initClass($c_sci_MapKeyValueTupleIterator, "scala.collection.immutable.MapKeyValueTupleIterator", ({
  sci_MapKeyValueTupleIterator: 1,
  sci_ChampBaseIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1
}));
function $p_sci_NewVectorIterator__advanceSlice__V($thiz) {
  if (($thiz.sci_NewVectorIterator__f_len1 <= $thiz.sci_NewVectorIterator__f_i1)) {
    $n($m_sc_Iterator$().sc_Iterator$__f__empty).next__O();
  }
  $thiz.sci_NewVectorIterator__f_sliceIdx = ((1 + $thiz.sci_NewVectorIterator__f_sliceIdx) | 0);
  var slice = $n($thiz.sci_NewVectorIterator__f_v).vectorSlice__I__AO($thiz.sci_NewVectorIterator__f_sliceIdx);
  while (($n(slice).u.length === 0)) {
    $thiz.sci_NewVectorIterator__f_sliceIdx = ((1 + $thiz.sci_NewVectorIterator__f_sliceIdx) | 0);
    slice = $n($thiz.sci_NewVectorIterator__f_v).vectorSlice__I__AO($thiz.sci_NewVectorIterator__f_sliceIdx);
  }
  $thiz.sci_NewVectorIterator__f_sliceStart = $thiz.sci_NewVectorIterator__f_sliceEnd;
  var count = $thiz.sci_NewVectorIterator__f_sliceCount;
  var idx = $thiz.sci_NewVectorIterator__f_sliceIdx;
  var c = (((count + ((count >>> 31) | 0)) | 0) >> 1);
  var a = ((idx - c) | 0);
  var sign = (a >> 31);
  $thiz.sci_NewVectorIterator__f_sliceDim = ((((1 + c) | 0) - (((a ^ sign) - sign) | 0)) | 0);
  var x46 = $thiz.sci_NewVectorIterator__f_sliceDim;
  switch (x46) {
    case 1: {
      $thiz.sci_NewVectorIterator__f_a1 = slice;
      break;
    }
    case 2: {
      $thiz.sci_NewVectorIterator__f_a2 = $asArrayOf_O(slice, 2);
      break;
    }
    case 3: {
      $thiz.sci_NewVectorIterator__f_a3 = $asArrayOf_O(slice, 3);
      break;
    }
    case 4: {
      $thiz.sci_NewVectorIterator__f_a4 = $asArrayOf_O(slice, 4);
      break;
    }
    case 5: {
      $thiz.sci_NewVectorIterator__f_a5 = $asArrayOf_O(slice, 5);
      break;
    }
    case 6: {
      $thiz.sci_NewVectorIterator__f_a6 = $asArrayOf_O(slice, 6);
      break;
    }
    default: {
      throw new $c_s_MatchError(x46);
    }
  }
  $thiz.sci_NewVectorIterator__f_sliceEnd = (($thiz.sci_NewVectorIterator__f_sliceStart + Math.imul($n(slice).u.length, (1 << Math.imul(5, (($thiz.sci_NewVectorIterator__f_sliceDim - 1) | 0))))) | 0);
  if (($thiz.sci_NewVectorIterator__f_sliceEnd > $thiz.sci_NewVectorIterator__f_totalLength)) {
    $thiz.sci_NewVectorIterator__f_sliceEnd = $thiz.sci_NewVectorIterator__f_totalLength;
  }
  if (($thiz.sci_NewVectorIterator__f_sliceDim > 1)) {
    $thiz.sci_NewVectorIterator__f_oldPos = (((1 << Math.imul(5, $thiz.sci_NewVectorIterator__f_sliceDim)) - 1) | 0);
  }
}
function $p_sci_NewVectorIterator__advance__V($thiz) {
  var pos = (((($thiz.sci_NewVectorIterator__f_i1 - $thiz.sci_NewVectorIterator__f_len1) | 0) + $thiz.sci_NewVectorIterator__f_totalLength) | 0);
  if ((pos === $thiz.sci_NewVectorIterator__f_sliceEnd)) {
    $p_sci_NewVectorIterator__advanceSlice__V($thiz);
  }
  if (($thiz.sci_NewVectorIterator__f_sliceDim > 1)) {
    var io = ((pos - $thiz.sci_NewVectorIterator__f_sliceStart) | 0);
    var xor = ($thiz.sci_NewVectorIterator__f_oldPos ^ io);
    $p_sci_NewVectorIterator__advanceA__I__I__V($thiz, io, xor);
    $thiz.sci_NewVectorIterator__f_oldPos = io;
  }
  $thiz.sci_NewVectorIterator__f_len1 = (($thiz.sci_NewVectorIterator__f_len1 - $thiz.sci_NewVectorIterator__f_i1) | 0);
  var a = $n($thiz.sci_NewVectorIterator__f_a1).u.length;
  var b = $thiz.sci_NewVectorIterator__f_len1;
  $thiz.sci_NewVectorIterator__f_a1len = ((a < b) ? a : b);
  $thiz.sci_NewVectorIterator__f_i1 = 0;
}
function $p_sci_NewVectorIterator__advanceA__I__I__V($thiz, io, xor) {
  if ((xor < 1024)) {
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get((31 & ((io >>> 5) | 0)));
  } else if ((xor < 32768)) {
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get((31 & ((io >>> 10) | 0)));
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get(0);
  } else if ((xor < 1048576)) {
    $thiz.sci_NewVectorIterator__f_a3 = $n($thiz.sci_NewVectorIterator__f_a4).get((31 & ((io >>> 15) | 0)));
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get(0);
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get(0);
  } else if ((xor < 33554432)) {
    $thiz.sci_NewVectorIterator__f_a4 = $n($thiz.sci_NewVectorIterator__f_a5).get((31 & ((io >>> 20) | 0)));
    $thiz.sci_NewVectorIterator__f_a3 = $n($thiz.sci_NewVectorIterator__f_a4).get(0);
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get(0);
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get(0);
  } else {
    $thiz.sci_NewVectorIterator__f_a5 = $n($thiz.sci_NewVectorIterator__f_a6).get(((io >>> 25) | 0));
    $thiz.sci_NewVectorIterator__f_a4 = $n($thiz.sci_NewVectorIterator__f_a5).get(0);
    $thiz.sci_NewVectorIterator__f_a3 = $n($thiz.sci_NewVectorIterator__f_a4).get(0);
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get(0);
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get(0);
  }
}
function $p_sci_NewVectorIterator__setA__I__I__V($thiz, io, xor) {
  if ((xor < 1024)) {
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get((31 & ((io >>> 5) | 0)));
  } else if ((xor < 32768)) {
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get((31 & ((io >>> 10) | 0)));
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get((31 & ((io >>> 5) | 0)));
  } else if ((xor < 1048576)) {
    $thiz.sci_NewVectorIterator__f_a3 = $n($thiz.sci_NewVectorIterator__f_a4).get((31 & ((io >>> 15) | 0)));
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get((31 & ((io >>> 10) | 0)));
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get((31 & ((io >>> 5) | 0)));
  } else if ((xor < 33554432)) {
    $thiz.sci_NewVectorIterator__f_a4 = $n($thiz.sci_NewVectorIterator__f_a5).get((31 & ((io >>> 20) | 0)));
    $thiz.sci_NewVectorIterator__f_a3 = $n($thiz.sci_NewVectorIterator__f_a4).get((31 & ((io >>> 15) | 0)));
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get((31 & ((io >>> 10) | 0)));
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get((31 & ((io >>> 5) | 0)));
  } else {
    $thiz.sci_NewVectorIterator__f_a5 = $n($thiz.sci_NewVectorIterator__f_a6).get(((io >>> 25) | 0));
    $thiz.sci_NewVectorIterator__f_a4 = $n($thiz.sci_NewVectorIterator__f_a5).get((31 & ((io >>> 20) | 0)));
    $thiz.sci_NewVectorIterator__f_a3 = $n($thiz.sci_NewVectorIterator__f_a4).get((31 & ((io >>> 15) | 0)));
    $thiz.sci_NewVectorIterator__f_a2 = $n($thiz.sci_NewVectorIterator__f_a3).get((31 & ((io >>> 10) | 0)));
    $thiz.sci_NewVectorIterator__f_a1 = $n($thiz.sci_NewVectorIterator__f_a2).get((31 & ((io >>> 5) | 0)));
  }
}
/** @constructor */
function $c_sci_NewVectorIterator(v, totalLength, sliceCount) {
  this.sci_NewVectorIterator__f_v = null;
  this.sci_NewVectorIterator__f_totalLength = 0;
  this.sci_NewVectorIterator__f_sliceCount = 0;
  this.sci_NewVectorIterator__f_a1 = null;
  this.sci_NewVectorIterator__f_a2 = null;
  this.sci_NewVectorIterator__f_a3 = null;
  this.sci_NewVectorIterator__f_a4 = null;
  this.sci_NewVectorIterator__f_a5 = null;
  this.sci_NewVectorIterator__f_a6 = null;
  this.sci_NewVectorIterator__f_a1len = 0;
  this.sci_NewVectorIterator__f_i1 = 0;
  this.sci_NewVectorIterator__f_oldPos = 0;
  this.sci_NewVectorIterator__f_len1 = 0;
  this.sci_NewVectorIterator__f_sliceIdx = 0;
  this.sci_NewVectorIterator__f_sliceDim = 0;
  this.sci_NewVectorIterator__f_sliceStart = 0;
  this.sci_NewVectorIterator__f_sliceEnd = 0;
  this.sci_NewVectorIterator__f_v = v;
  this.sci_NewVectorIterator__f_totalLength = totalLength;
  this.sci_NewVectorIterator__f_sliceCount = sliceCount;
  this.sci_NewVectorIterator__f_a1 = $n(v).sci_Vector__f_prefix1;
  this.sci_NewVectorIterator__f_a1len = $n(this.sci_NewVectorIterator__f_a1).u.length;
  this.sci_NewVectorIterator__f_i1 = 0;
  this.sci_NewVectorIterator__f_oldPos = 0;
  this.sci_NewVectorIterator__f_len1 = this.sci_NewVectorIterator__f_totalLength;
  this.sci_NewVectorIterator__f_sliceIdx = 0;
  this.sci_NewVectorIterator__f_sliceDim = 1;
  this.sci_NewVectorIterator__f_sliceStart = 0;
  this.sci_NewVectorIterator__f_sliceEnd = this.sci_NewVectorIterator__f_a1len;
}
$c_sci_NewVectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_NewVectorIterator.prototype.constructor = $c_sci_NewVectorIterator;
/** @constructor */
function $h_sci_NewVectorIterator() {
}
$h_sci_NewVectorIterator.prototype = $c_sci_NewVectorIterator.prototype;
$c_sci_NewVectorIterator.prototype.knownSize__I = (function() {
  return ((this.sci_NewVectorIterator__f_len1 - this.sci_NewVectorIterator__f_i1) | 0);
});
$c_sci_NewVectorIterator.prototype.hasNext__Z = (function() {
  return (this.sci_NewVectorIterator__f_len1 > this.sci_NewVectorIterator__f_i1);
});
$c_sci_NewVectorIterator.prototype.next__O = (function() {
  if ((this.sci_NewVectorIterator__f_i1 === this.sci_NewVectorIterator__f_a1len)) {
    $p_sci_NewVectorIterator__advance__V(this);
  }
  var r = $n(this.sci_NewVectorIterator__f_a1).get(this.sci_NewVectorIterator__f_i1);
  this.sci_NewVectorIterator__f_i1 = ((1 + this.sci_NewVectorIterator__f_i1) | 0);
  return r;
});
$c_sci_NewVectorIterator.prototype.drop__I__sc_Iterator = (function(n) {
  if ((n > 0)) {
    var oldpos = ((((this.sci_NewVectorIterator__f_i1 - this.sci_NewVectorIterator__f_len1) | 0) + this.sci_NewVectorIterator__f_totalLength) | 0);
    var a = ((oldpos + n) | 0);
    var b = this.sci_NewVectorIterator__f_totalLength;
    var newpos = ((a < b) ? a : b);
    if ((newpos === this.sci_NewVectorIterator__f_totalLength)) {
      this.sci_NewVectorIterator__f_i1 = 0;
      this.sci_NewVectorIterator__f_len1 = 0;
      this.sci_NewVectorIterator__f_a1len = 0;
    } else {
      while ((newpos >= this.sci_NewVectorIterator__f_sliceEnd)) {
        $p_sci_NewVectorIterator__advanceSlice__V(this);
      }
      var io = ((newpos - this.sci_NewVectorIterator__f_sliceStart) | 0);
      if ((this.sci_NewVectorIterator__f_sliceDim > 1)) {
        var xor = (this.sci_NewVectorIterator__f_oldPos ^ io);
        $p_sci_NewVectorIterator__setA__I__I__V(this, io, xor);
        this.sci_NewVectorIterator__f_oldPos = io;
      }
      this.sci_NewVectorIterator__f_a1len = $n(this.sci_NewVectorIterator__f_a1).u.length;
      this.sci_NewVectorIterator__f_i1 = (31 & io);
      this.sci_NewVectorIterator__f_len1 = ((this.sci_NewVectorIterator__f_i1 + ((this.sci_NewVectorIterator__f_totalLength - newpos) | 0)) | 0);
      if ((this.sci_NewVectorIterator__f_a1len > this.sci_NewVectorIterator__f_len1)) {
        this.sci_NewVectorIterator__f_a1len = this.sci_NewVectorIterator__f_len1;
      }
    }
  }
  return this;
});
$c_sci_NewVectorIterator.prototype.copyToArray__O__I__I__I = (function(xs, start, len) {
  var xsLen = $m_jl_reflect_Array$().getLength__O__I(xs);
  var srcLen = ((this.sci_NewVectorIterator__f_len1 - this.sci_NewVectorIterator__f_i1) | 0);
  var limit = ((len < srcLen) ? len : srcLen);
  var capacity = ((start < 0) ? xsLen : ((xsLen - start) | 0));
  var total = ((capacity < limit) ? capacity : limit);
  var total$1 = ((total < 0) ? 0 : total);
  var copied = 0;
  var isBoxed = (xs instanceof $ac_O);
  while ((copied < total$1)) {
    if ((this.sci_NewVectorIterator__f_i1 === this.sci_NewVectorIterator__f_a1len)) {
      $p_sci_NewVectorIterator__advance__V(this);
    }
    var a = ((total$1 - copied) | 0);
    var b = (($n(this.sci_NewVectorIterator__f_a1).u.length - this.sci_NewVectorIterator__f_i1) | 0);
    var count = ((a < b) ? a : b);
    if (isBoxed) {
      var src = this.sci_NewVectorIterator__f_a1;
      var srcPos = this.sci_NewVectorIterator__f_i1;
      var destPos = ((start + copied) | 0);
      $systemArraycopyFull($n(src), srcPos, $n(xs), destPos, count);
    } else {
      $m_s_Array$().copy__O__I__O__I__I__V(this.sci_NewVectorIterator__f_a1, this.sci_NewVectorIterator__f_i1, xs, ((start + copied) | 0), count);
    }
    this.sci_NewVectorIterator__f_i1 = ((this.sci_NewVectorIterator__f_i1 + count) | 0);
    copied = ((copied + count) | 0);
  }
  return total$1;
});
var $d_sci_NewVectorIterator = new $TypeData().initClass($c_sci_NewVectorIterator, "scala.collection.immutable.NewVectorIterator", ({
  sci_NewVectorIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1,
  jl_Cloneable: 1
}));
function $f_sc_View__toString__T($thiz) {
  return ($thiz.className__T() + "(<not computed>)");
}
/** @constructor */
function $c_scm_CheckedIndexedSeqView$CheckedIterator(self, mutationCount) {
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_self = null;
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_current = 0;
  this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder = 0;
  this.scm_CheckedIndexedSeqView$CheckedIterator__f_mutationCount = null;
  this.scm_CheckedIndexedSeqView$CheckedIterator__f_expectedCount = 0;
  this.scm_CheckedIndexedSeqView$CheckedIterator__f_mutationCount = mutationCount;
  $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(this, self);
  this.scm_CheckedIndexedSeqView$CheckedIterator__f_expectedCount = $uI($n(mutationCount).apply__O());
}
$c_scm_CheckedIndexedSeqView$CheckedIterator.prototype = new $h_sc_IndexedSeqView$IndexedSeqViewIterator();
$c_scm_CheckedIndexedSeqView$CheckedIterator.prototype.constructor = $c_scm_CheckedIndexedSeqView$CheckedIterator;
/** @constructor */
function $h_scm_CheckedIndexedSeqView$CheckedIterator() {
}
$h_scm_CheckedIndexedSeqView$CheckedIterator.prototype = $c_scm_CheckedIndexedSeqView$CheckedIterator.prototype;
$c_scm_CheckedIndexedSeqView$CheckedIterator.prototype.hasNext__Z = (function() {
  var this$1 = $m_scm_MutationTracker$();
  var expectedCount = this.scm_CheckedIndexedSeqView$CheckedIterator__f_expectedCount;
  var actualCount = $uI($n(this.scm_CheckedIndexedSeqView$CheckedIterator__f_mutationCount).apply__O());
  this$1.checkMutations__I__I__T__V(expectedCount, actualCount, "mutation occurred during iteration");
  return (this.sc_IndexedSeqView$IndexedSeqViewIterator__f_remainder > 0);
});
var $d_scm_CheckedIndexedSeqView$CheckedIterator = new $TypeData().initClass($c_scm_CheckedIndexedSeqView$CheckedIterator, "scala.collection.mutable.CheckedIndexedSeqView$CheckedIterator", ({
  scm_CheckedIndexedSeqView$CheckedIterator: 1,
  sc_IndexedSeqView$IndexedSeqViewIterator: 1,
  sc_AbstractIterator: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_Iterator: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  this.s_reflect_AnyValManifest__f_toString = null;
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.s_reflect_AnyValManifest__f_toString;
});
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that);
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this);
});
function $as_sjs_js_JavaScriptException(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"));
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)));
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth));
}
function $p_sc_StrictOptimizedLinearSeqOps__loop$2__I__sc_LinearSeq__sc_LinearSeq($thiz, n, s) {
  var s$tailLocal1 = s;
  var n$tailLocal1 = n;
  while (true) {
    if (((n$tailLocal1 <= 0) || $n(s$tailLocal1).isEmpty__Z())) {
      return s$tailLocal1;
    } else {
      var n$tailLocal1$tmp1 = ((n$tailLocal1 - 1) | 0);
      var s$tailLocal1$tmp1 = $as_sc_LinearSeq($n(s$tailLocal1).tail__O());
      n$tailLocal1 = n$tailLocal1$tmp1;
      s$tailLocal1 = s$tailLocal1$tmp1;
    }
  }
}
function $is_sc_StrictOptimizedLinearSeqOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_StrictOptimizedLinearSeqOps)));
}
function $as_sc_StrictOptimizedLinearSeqOps(obj) {
  return (($is_sc_StrictOptimizedLinearSeqOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.StrictOptimizedLinearSeqOps"));
}
function $isArrayOf_sc_StrictOptimizedLinearSeqOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_StrictOptimizedLinearSeqOps)));
}
function $asArrayOf_sc_StrictOptimizedLinearSeqOps(obj, depth) {
  return (($isArrayOf_sc_StrictOptimizedLinearSeqOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.StrictOptimizedLinearSeqOps;", depth));
}
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest() {
  this.s_reflect_AnyValManifest__f_toString = null;
}
$c_s_reflect_ManifestFactory$BooleanManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest() {
}
$h_s_reflect_ManifestFactory$BooleanManifest.prototype = $c_s_reflect_ManifestFactory$BooleanManifest.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_Z.getClassOf();
});
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest() {
  this.s_reflect_AnyValManifest__f_toString = null;
}
$c_s_reflect_ManifestFactory$DoubleManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest() {
}
$h_s_reflect_ManifestFactory$DoubleManifest.prototype = $c_s_reflect_ManifestFactory$DoubleManifest.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_D.getClassOf();
});
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest() {
  this.s_reflect_AnyValManifest__f_toString = null;
}
$c_s_reflect_ManifestFactory$IntManifest.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest() {
}
$h_s_reflect_ManifestFactory$IntManifest.prototype = $c_s_reflect_ManifestFactory$IntManifest.prototype;
$c_s_reflect_ManifestFactory$IntManifest.prototype.runtimeClass__jl_Class = (function() {
  return $d_I.getClassOf();
});
/** @constructor */
function $c_sc_AbstractView() {
}
$c_sc_AbstractView.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractView.prototype.constructor = $c_sc_AbstractView;
/** @constructor */
function $h_sc_AbstractView() {
}
$h_sc_AbstractView.prototype = $c_sc_AbstractView.prototype;
$c_sc_AbstractView.prototype.toString__T = (function() {
  return $f_sc_View__toString__T(this);
});
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  this.s_reflect_AnyValManifest__f_toString = null;
  this.s_reflect_AnyValManifest__f_toString = "Boolean";
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_ManifestFactory$BooleanManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass($c_s_reflect_ManifestFactory$BooleanManifest$, "scala.reflect.ManifestFactory$BooleanManifest$", ({
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_ManifestFactory$BooleanManifest: 1,
  s_reflect_AnyValManifest: 1,
  Ljava_io_Serializable: 1,
  s_reflect_OptManifest: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_Equals: 1,
  s_reflect_ClassTag: 1,
  s_reflect_Manifest: 1
}));
var $n_s_reflect_ManifestFactory$BooleanManifest$;
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$();
  }
  return $n_s_reflect_ManifestFactory$BooleanManifest$;
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  this.s_reflect_AnyValManifest__f_toString = null;
  this.s_reflect_AnyValManifest__f_toString = "Double";
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_ManifestFactory$DoubleManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass($c_s_reflect_ManifestFactory$DoubleManifest$, "scala.reflect.ManifestFactory$DoubleManifest$", ({
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_ManifestFactory$DoubleManifest: 1,
  s_reflect_AnyValManifest: 1,
  Ljava_io_Serializable: 1,
  s_reflect_OptManifest: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_Equals: 1,
  s_reflect_ClassTag: 1,
  s_reflect_Manifest: 1
}));
var $n_s_reflect_ManifestFactory$DoubleManifest$;
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$();
  }
  return $n_s_reflect_ManifestFactory$DoubleManifest$;
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  this.s_reflect_AnyValManifest__f_toString = null;
  this.s_reflect_AnyValManifest__f_toString = "Int";
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_ManifestFactory$IntManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass($c_s_reflect_ManifestFactory$IntManifest$, "scala.reflect.ManifestFactory$IntManifest$", ({
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_ManifestFactory$IntManifest: 1,
  s_reflect_AnyValManifest: 1,
  Ljava_io_Serializable: 1,
  s_reflect_OptManifest: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_Equals: 1,
  s_reflect_ClassTag: 1,
  s_reflect_Manifest: 1
}));
var $n_s_reflect_ManifestFactory$IntManifest$;
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$();
  }
  return $n_s_reflect_ManifestFactory$IntManifest$;
}
function $f_sc_Seq__equals__O__Z($thiz, o) {
  if (($thiz === o)) {
    return true;
  } else {
    if ($is_sc_Seq(o)) {
      var seq = $as_sc_Seq(o);
      if ($n(seq).canEqual__O__Z($thiz)) {
        return $thiz.sameElements__sc_IterableOnce__Z(seq);
      }
    }
    return false;
  }
}
function $is_sc_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)));
}
function $as_sc_Seq(obj) {
  return (($is_sc_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Seq"));
}
function $isArrayOf_sc_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)));
}
function $asArrayOf_sc_Seq(obj, depth) {
  return (($isArrayOf_sc_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Seq;", depth));
}
function $f_sc_Map__equals__O__Z($thiz, o) {
  if (($thiz === o)) {
    return true;
  } else {
    if ($is_sc_Map(o)) {
      var map = $as_sc_Map(o);
      if (($n(map), true)) {
        if (($thiz.size__I() === $n(map).size__I())) {
          try {
            return $thiz.forall__F1__Z(new $c_sr_AbstractFunction1_$$Lambda$7afc3dd0acc1681fb022ef921c83979087aaa919(((kv$2) => {
              var kv = $as_T2(kv$2);
              var x = $n(map).getOrElse__O__F0__O($n(kv)._1__O(), new $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c((() => $n($m_sc_Map$().sc_Map$__f_scala$collection$Map$$$DefaultSentinelFn).apply__O())));
              var y = $n(kv)._2__O();
              return $m_sr_BoxesRunTime$().equals__O__O__Z(x, y);
            })));
          } catch (e) {
            if ((e instanceof $c_jl_ClassCastException)) {
              return false;
            } else {
              throw e;
            }
          }
        } else {
          return false;
        }
      }
    }
    return false;
  }
}
function $is_sc_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Map)));
}
function $as_sc_Map(obj) {
  return (($is_sc_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Map"));
}
function $isArrayOf_sc_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Map)));
}
function $asArrayOf_sc_Map(obj, depth) {
  return (($isArrayOf_sc_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Map;", depth));
}
/** @constructor */
function $c_sc_AbstractSeq() {
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this);
});
$c_sc_AbstractSeq.prototype.sameElements__sc_IterableOnce__Z = (function(that) {
  return $f_sc_SeqOps__sameElements__sc_IterableOnce__Z(this, that);
});
$c_sc_AbstractSeq.prototype.canEqual__O__Z = (function(that) {
  return true;
});
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(o) {
  return $f_sc_Seq__equals__O__Z(this, o);
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this);
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $f_sc_Iterable__toString__T(this);
});
/** @constructor */
function $c_sc_AbstractSeqView() {
}
$c_sc_AbstractSeqView.prototype = new $h_sc_AbstractView();
$c_sc_AbstractSeqView.prototype.constructor = $c_sc_AbstractSeqView;
/** @constructor */
function $h_sc_AbstractSeqView() {
}
$h_sc_AbstractSeqView.prototype = $c_sc_AbstractSeqView.prototype;
$c_sc_AbstractSeqView.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this);
});
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)));
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"));
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)));
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth));
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)));
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"));
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)));
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth));
}
/** @constructor */
function $c_sc_AbstractMap() {
}
$c_sc_AbstractMap.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractMap.prototype.constructor = $c_sc_AbstractMap;
/** @constructor */
function $h_sc_AbstractMap() {
}
$h_sc_AbstractMap.prototype = $c_sc_AbstractMap.prototype;
$c_sc_AbstractMap.prototype.foreachEntry__F2__V = (function(f) {
  $f_sc_MapOps__foreachEntry__F2__V(this, f);
});
$c_sc_AbstractMap.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(sb, start, sep, end) {
  return $f_sc_MapOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, sb, start, sep, end);
});
$c_sc_AbstractMap.prototype.equals__O__Z = (function(o) {
  return $f_sc_Map__equals__O__Z(this, o);
});
$c_sc_AbstractMap.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().mapHash__sc_Map__I(this);
});
$c_sc_AbstractMap.prototype.stringPrefix__T = (function() {
  return "Map";
});
$c_sc_AbstractMap.prototype.toString__T = (function() {
  return $f_sc_Iterable__toString__T(this);
});
function $ct_sc_SeqView$Id__sc_SeqOps__($thiz, underlying) {
  $thiz.sc_SeqView$Id__f_underlying = underlying;
  return $thiz;
}
/** @constructor */
function $c_sc_SeqView$Id() {
  this.sc_SeqView$Id__f_underlying = null;
}
$c_sc_SeqView$Id.prototype = new $h_sc_AbstractSeqView();
$c_sc_SeqView$Id.prototype.constructor = $c_sc_SeqView$Id;
/** @constructor */
function $h_sc_SeqView$Id() {
}
$h_sc_SeqView$Id.prototype = $c_sc_SeqView$Id.prototype;
$c_sc_SeqView$Id.prototype.apply__I__O = (function(idx) {
  return $n(this.sc_SeqView$Id__f_underlying).apply__I__O(idx);
});
$c_sc_SeqView$Id.prototype.length__I = (function() {
  return $n(this.sc_SeqView$Id__f_underlying).length__I();
});
$c_sc_SeqView$Id.prototype.isEmpty__Z = (function() {
  return $n(this.sc_SeqView$Id__f_underlying).isEmpty__Z();
});
function $is_sci_Map(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Map)));
}
function $as_sci_Map(obj) {
  return (($is_sci_Map(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map"));
}
function $isArrayOf_sci_Map(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map)));
}
function $asArrayOf_sci_Map(obj, depth) {
  return (($isArrayOf_sci_Map(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map;", depth));
}
/** @constructor */
function $c_sc_AbstractIndexedSeqView() {
}
$c_sc_AbstractIndexedSeqView.prototype = new $h_sc_AbstractSeqView();
$c_sc_AbstractIndexedSeqView.prototype.constructor = $c_sc_AbstractIndexedSeqView;
/** @constructor */
function $h_sc_AbstractIndexedSeqView() {
}
$h_sc_AbstractIndexedSeqView.prototype = $c_sc_AbstractIndexedSeqView.prototype;
$c_sc_AbstractIndexedSeqView.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_sc_AbstractIndexedSeqView.prototype.knownSize__I = (function() {
  return this.length__I();
});
$c_sc_AbstractIndexedSeqView.prototype.stringPrefix__T = (function() {
  return "IndexedSeqView";
});
/** @constructor */
function $c_sc_IndexedSeqView$Id(underlying) {
  this.sc_SeqView$Id__f_underlying = null;
  $ct_sc_SeqView$Id__sc_SeqOps__(this, underlying);
}
$c_sc_IndexedSeqView$Id.prototype = new $h_sc_SeqView$Id();
$c_sc_IndexedSeqView$Id.prototype.constructor = $c_sc_IndexedSeqView$Id;
/** @constructor */
function $h_sc_IndexedSeqView$Id() {
}
$h_sc_IndexedSeqView$Id.prototype = $c_sc_IndexedSeqView$Id.prototype;
$c_sc_IndexedSeqView$Id.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_sc_IndexedSeqView$Id.prototype.knownSize__I = (function() {
  return this.length__I();
});
$c_sc_IndexedSeqView$Id.prototype.iterator__sc_Iterator = (function() {
  return $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this);
});
$c_sc_IndexedSeqView$Id.prototype.stringPrefix__T = (function() {
  return "IndexedSeqView";
});
var $d_sc_IndexedSeqView$Id = new $TypeData().initClass($c_sc_IndexedSeqView$Id, "scala.collection.IndexedSeqView$Id", ({
  sc_IndexedSeqView$Id: 1,
  sc_SeqView$Id: 1,
  sc_AbstractSeqView: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  Ljava_io_Serializable: 1,
  sc_View: 1,
  sc_SeqOps: 1,
  sc_SeqView: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeqView: 1
}));
/** @constructor */
function $c_sci_AbstractSeq() {
}
$c_sci_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_sci_AbstractSeq.prototype.constructor = $c_sci_AbstractSeq;
/** @constructor */
function $h_sci_AbstractSeq() {
}
$h_sci_AbstractSeq.prototype = $c_sci_AbstractSeq.prototype;
/** @constructor */
function $c_scm_ArrayBufferView(underlying, mutationCount) {
  this.scm_ArrayBufferView__f_underlying = null;
  this.scm_ArrayBufferView__f_mutationCount = null;
  this.scm_ArrayBufferView__f_underlying = underlying;
  this.scm_ArrayBufferView__f_mutationCount = mutationCount;
}
$c_scm_ArrayBufferView.prototype = new $h_sc_AbstractIndexedSeqView();
$c_scm_ArrayBufferView.prototype.constructor = $c_scm_ArrayBufferView;
/** @constructor */
function $h_scm_ArrayBufferView() {
}
$h_scm_ArrayBufferView.prototype = $c_scm_ArrayBufferView.prototype;
$c_scm_ArrayBufferView.prototype.apply__I__O = (function(n) {
  return $n(this.scm_ArrayBufferView__f_underlying).apply__I__O(n);
});
$c_scm_ArrayBufferView.prototype.length__I = (function() {
  var this$1 = $n(this.scm_ArrayBufferView__f_underlying);
  return this$1.scm_ArrayBuffer__f_size0;
});
$c_scm_ArrayBufferView.prototype.className__T = (function() {
  return "ArrayBufferView";
});
$c_scm_ArrayBufferView.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_CheckedIndexedSeqView$CheckedIterator(this, this.scm_ArrayBufferView__f_mutationCount);
});
var $d_scm_ArrayBufferView = new $TypeData().initClass($c_scm_ArrayBufferView, "scala.collection.mutable.ArrayBufferView", ({
  scm_ArrayBufferView: 1,
  sc_AbstractIndexedSeqView: 1,
  sc_AbstractSeqView: 1,
  sc_AbstractView: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  Ljava_io_Serializable: 1,
  sc_View: 1,
  sc_SeqOps: 1,
  sc_SeqView: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeqView: 1
}));
/** @constructor */
function $c_sci_AbstractMap() {
}
$c_sci_AbstractMap.prototype = new $h_sc_AbstractMap();
$c_sci_AbstractMap.prototype.constructor = $c_sci_AbstractMap;
/** @constructor */
function $h_sci_AbstractMap() {
}
$h_sci_AbstractMap.prototype = $c_sci_AbstractMap.prototype;
function $f_sci_IndexedSeq__canEqual__O__Z($thiz, that) {
  if ($is_sci_IndexedSeq(that)) {
    var otherIndexedSeq = $as_sci_IndexedSeq(that);
    return ($thiz.length__I() === $n(otherIndexedSeq).length__I());
  } else {
    return true;
  }
}
function $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z($thiz, o) {
  if ($is_sci_IndexedSeq(o)) {
    var that = $as_sci_IndexedSeq(o);
    if (($thiz === that)) {
      return true;
    } else {
      var length = $thiz.length__I();
      var equal = (length === $n(that).length__I());
      if (equal) {
        var index = 0;
        var a = $thiz.applyPreferredMaxLength__I();
        var b = $n(that).applyPreferredMaxLength__I();
        var preferredLength = ((a < b) ? a : b);
        var hi = (length >> 31);
        var hi$1 = (preferredLength >> 31);
        var lo = (preferredLength << 1);
        var hi$2 = (((preferredLength >>> 31) | 0) | (hi$1 << 1));
        if (((hi === hi$2) ? ((length >>> 0) > (lo >>> 0)) : (hi > hi$2))) {
          var maxApplyCompare = preferredLength;
        } else {
          var maxApplyCompare = length;
        }
        while (((index < maxApplyCompare) && equal)) {
          var x = $thiz.apply__I__O(index);
          var y = $n(that).apply__I__O(index);
          equal = $m_sr_BoxesRunTime$().equals__O__O__Z(x, y);
          index = ((1 + index) | 0);
        }
        if (((index < length) && equal)) {
          var thisIt = $n($thiz.iterator__sc_Iterator()).drop__I__sc_Iterator(index);
          var thatIt = $n($n(that).iterator__sc_Iterator()).drop__I__sc_Iterator(index);
          while ((equal && $n(thisIt).hasNext__Z())) {
            var x$1 = $n(thisIt).next__O();
            var y$1 = $n(thatIt).next__O();
            equal = $m_sr_BoxesRunTime$().equals__O__O__Z(x$1, y$1);
          }
        }
      }
      return equal;
    }
  } else {
    return $f_sc_SeqOps__sameElements__sc_IterableOnce__Z($thiz, o);
  }
}
function $is_sci_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_IndexedSeq)));
}
function $as_sci_IndexedSeq(obj) {
  return (($is_sci_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.IndexedSeq"));
}
function $isArrayOf_sci_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_IndexedSeq)));
}
function $asArrayOf_sci_IndexedSeq(obj, depth) {
  return (($isArrayOf_sci_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.IndexedSeq;", depth));
}
function $as_sci_SeqMap$SeqMap1(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.SeqMap$SeqMap1"));
}
function $isArrayOf_sci_SeqMap$SeqMap1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_SeqMap$SeqMap1)));
}
function $asArrayOf_sci_SeqMap$SeqMap1(obj, depth) {
  return (($isArrayOf_sci_SeqMap$SeqMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.SeqMap$SeqMap1;", depth));
}
function $as_sci_SeqMap$SeqMap2(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.SeqMap$SeqMap2"));
}
function $isArrayOf_sci_SeqMap$SeqMap2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_SeqMap$SeqMap2)));
}
function $asArrayOf_sci_SeqMap$SeqMap2(obj, depth) {
  return (($isArrayOf_sci_SeqMap$SeqMap2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.SeqMap$SeqMap2;", depth));
}
function $as_sci_SeqMap$SeqMap3(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.SeqMap$SeqMap3"));
}
function $isArrayOf_sci_SeqMap$SeqMap3(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_SeqMap$SeqMap3)));
}
function $asArrayOf_sci_SeqMap$SeqMap3(obj, depth) {
  return (($isArrayOf_sci_SeqMap$SeqMap3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.SeqMap$SeqMap3;", depth));
}
function $as_sci_SeqMap$SeqMap4(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.SeqMap$SeqMap4"));
}
function $isArrayOf_sci_SeqMap$SeqMap4(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_SeqMap$SeqMap4)));
}
function $asArrayOf_sci_SeqMap$SeqMap4(obj, depth) {
  return (($isArrayOf_sci_SeqMap$SeqMap4(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.SeqMap$SeqMap4;", depth));
}
/** @constructor */
function $c_scm_AbstractSeq() {
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
/** @constructor */
function $c_sci_Map$EmptyMap$() {
}
$c_sci_Map$EmptyMap$.prototype = new $h_sci_AbstractMap();
$c_sci_Map$EmptyMap$.prototype.constructor = $c_sci_Map$EmptyMap$;
/** @constructor */
function $h_sci_Map$EmptyMap$() {
}
$h_sci_Map$EmptyMap$.prototype = $c_sci_Map$EmptyMap$.prototype;
$c_sci_Map$EmptyMap$.prototype.size__I = (function() {
  return 0;
});
$c_sci_Map$EmptyMap$.prototype.knownSize__I = (function() {
  return 0;
});
$c_sci_Map$EmptyMap$.prototype.isEmpty__Z = (function() {
  return true;
});
$c_sci_Map$EmptyMap$.prototype.apply__O__E = (function(key) {
  throw new $c_ju_NoSuchElementException(("key not found: " + key));
});
$c_sci_Map$EmptyMap$.prototype.contains__O__Z = (function(key) {
  return false;
});
$c_sci_Map$EmptyMap$.prototype.get__O__s_Option = (function(key) {
  return $m_s_None$();
});
$c_sci_Map$EmptyMap$.prototype.getOrElse__O__F0__O = (function(key, default$1) {
  return $n(default$1).apply__O();
});
$c_sci_Map$EmptyMap$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().sc_Iterator$__f__empty;
});
$c_sci_Map$EmptyMap$.prototype.apply__O__O = (function(key) {
  this.apply__O__E(key);
});
$c_sci_Map$EmptyMap$.prototype.updated__O__O__sci_MapOps = (function(key, value) {
  return new $c_sci_Map$Map1(key, value);
});
var $d_sci_Map$EmptyMap$ = new $TypeData().initClass($c_sci_Map$EmptyMap$, "scala.collection.immutable.Map$EmptyMap$", ({
  sci_Map$EmptyMap$: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_MapOps: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  sc_Map: 1,
  sci_Iterable: 1,
  sci_MapOps: 1,
  sci_Map: 1,
  Ljava_io_Serializable: 1
}));
var $n_sci_Map$EmptyMap$;
function $m_sci_Map$EmptyMap$() {
  if ((!$n_sci_Map$EmptyMap$)) {
    $n_sci_Map$EmptyMap$ = new $c_sci_Map$EmptyMap$();
  }
  return $n_sci_Map$EmptyMap$;
}
/** @constructor */
function $c_sci_Map$Map1(key1, value1) {
  this.sci_Map$Map1__f_key1 = null;
  this.sci_Map$Map1__f_value1 = null;
  this.sci_Map$Map1__f_key1 = key1;
  this.sci_Map$Map1__f_value1 = value1;
}
$c_sci_Map$Map1.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map1.prototype.constructor = $c_sci_Map$Map1;
/** @constructor */
function $h_sci_Map$Map1() {
}
$h_sci_Map$Map1.prototype = $c_sci_Map$Map1.prototype;
$c_sci_Map$Map1.prototype.size__I = (function() {
  return 1;
});
$c_sci_Map$Map1.prototype.knownSize__I = (function() {
  return 1;
});
$c_sci_Map$Map1.prototype.isEmpty__Z = (function() {
  return false;
});
$c_sci_Map$Map1.prototype.apply__O__O = (function(key) {
  var y = this.sci_Map$Map1__f_key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map1__f_value1;
  } else {
    throw new $c_ju_NoSuchElementException(("key not found: " + key));
  }
});
$c_sci_Map$Map1.prototype.contains__O__Z = (function(key) {
  var y = this.sci_Map$Map1__f_key1;
  return $m_sr_BoxesRunTime$().equals__O__O__Z(key, y);
});
$c_sci_Map$Map1.prototype.get__O__s_Option = (function(key) {
  var y = this.sci_Map$Map1__f_key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    var value = this.sci_Map$Map1__f_value1;
    return new $c_s_Some(value);
  } else {
    return $m_s_None$();
  }
});
$c_sci_Map$Map1.prototype.getOrElse__O__F0__O = (function(key, default$1) {
  var y = this.sci_Map$Map1__f_key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map1__f_value1;
  } else {
    return $n(default$1).apply__O();
  }
});
$c_sci_Map$Map1.prototype.iterator__sc_Iterator = (function() {
  var _1 = this.sci_Map$Map1__f_key1;
  var _2 = this.sci_Map$Map1__f_value1;
  var a = new $c_T2(_1, _2);
  return new $c_sc_Iterator$$anon$20(a);
});
$c_sci_Map$Map1.prototype.updated__O__O__sci_Map = (function(key, value) {
  var y = this.sci_Map$Map1__f_key1;
  return $as_sci_Map(($m_sr_BoxesRunTime$().equals__O__O__Z(key, y) ? new $c_sci_Map$Map1(this.sci_Map$Map1__f_key1, value) : new $c_sci_Map$Map2(this.sci_Map$Map1__f_key1, this.sci_Map$Map1__f_value1, key, value)));
});
$c_sci_Map$Map1.prototype.forall__F1__Z = (function(p) {
  var _1 = this.sci_Map$Map1__f_key1;
  var _2 = this.sci_Map$Map1__f_value1;
  return $uZ($n(p).apply__O__O(new $c_T2(_1, _2)));
});
$c_sci_Map$Map1.prototype.hashCode__I = (function() {
  var a = 0;
  var b = 0;
  var c = 1;
  var h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map1__f_key1, this.sci_Map$Map1__f_value1);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().s_util_hashing_MurmurHash3$__f_mapSeed;
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, a);
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, b);
  h = $m_s_util_hashing_MurmurHash3$().mixLast__I__I__I(h, c);
  return $m_s_util_hashing_MurmurHash3$().finalizeHash__I__I__I(h, 1);
});
$c_sci_Map$Map1.prototype.updated__O__O__sci_MapOps = (function(key, value) {
  return this.updated__O__O__sci_Map(key, value);
});
function $as_sci_Map$Map1(obj) {
  return (((obj instanceof $c_sci_Map$Map1) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map$Map1"));
}
function $isArrayOf_sci_Map$Map1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map$Map1)));
}
function $asArrayOf_sci_Map$Map1(obj, depth) {
  return (($isArrayOf_sci_Map$Map1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map$Map1;", depth));
}
var $d_sci_Map$Map1 = new $TypeData().initClass($c_sci_Map$Map1, "scala.collection.immutable.Map$Map1", ({
  sci_Map$Map1: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_MapOps: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  sc_Map: 1,
  sci_Iterable: 1,
  sci_MapOps: 1,
  sci_Map: 1,
  sc_StrictOptimizedIterableOps: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sci_Map$Map2(key1, value1, key2, value2) {
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1 = null;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1 = null;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2 = null;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2 = null;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1 = key1;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1 = value1;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2 = key2;
  this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2 = value2;
}
$c_sci_Map$Map2.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map2.prototype.constructor = $c_sci_Map$Map2;
/** @constructor */
function $h_sci_Map$Map2() {
}
$h_sci_Map$Map2.prototype = $c_sci_Map$Map2.prototype;
$c_sci_Map$Map2.prototype.size__I = (function() {
  return 2;
});
$c_sci_Map$Map2.prototype.knownSize__I = (function() {
  return 2;
});
$c_sci_Map$Map2.prototype.isEmpty__Z = (function() {
  return false;
});
$c_sci_Map$Map2.prototype.apply__O__O = (function(key) {
  var y = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1;
  } else {
    var y$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2;
    } else {
      throw new $c_ju_NoSuchElementException(("key not found: " + key));
    }
  }
});
$c_sci_Map$Map2.prototype.contains__O__Z = (function(key) {
  var y = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return true;
  } else {
    var y$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
    return $m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1);
  }
});
$c_sci_Map$Map2.prototype.get__O__s_Option = (function(key) {
  var y = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    var value = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1;
    return new $c_s_Some(value);
  } else {
    var y$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      var value$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2;
      return new $c_s_Some(value$1);
    } else {
      return $m_s_None$();
    }
  }
});
$c_sci_Map$Map2.prototype.getOrElse__O__F0__O = (function(key, default$1) {
  var y = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1;
  } else {
    var y$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2;
    } else {
      return $n(default$1).apply__O();
    }
  }
});
$c_sci_Map$Map2.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_Map$Map2$$anon$1(this);
});
$c_sci_Map$Map2.prototype.updated__O__O__sci_Map = (function(key, value) {
  var y = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return new $c_sci_Map$Map2(this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1, value, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2);
  } else {
    var y$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
    return $as_sci_Map(($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1) ? new $c_sci_Map$Map2(this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2, value) : new $c_sci_Map$Map3(this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2, key, value)));
  }
});
$c_sci_Map$Map2.prototype.forall__F1__Z = (function(p) {
  var _1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1;
  var _2 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1;
  if ($uZ($n(p).apply__O__O(new $c_T2(_1, _2)))) {
    var _1$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2;
    var _2$1 = this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2;
    return $uZ($n(p).apply__O__O(new $c_T2(_1$1, _2$1)));
  } else {
    return false;
  }
});
$c_sci_Map$Map2.prototype.hashCode__I = (function() {
  var a = 0;
  var b = 0;
  var c = 1;
  var h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key1, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value1);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$key2, this.sci_Map$Map2__f_scala$collection$immutable$Map$Map2$$value2);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().s_util_hashing_MurmurHash3$__f_mapSeed;
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, a);
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, b);
  h = $m_s_util_hashing_MurmurHash3$().mixLast__I__I__I(h, c);
  return $m_s_util_hashing_MurmurHash3$().finalizeHash__I__I__I(h, 2);
});
$c_sci_Map$Map2.prototype.updated__O__O__sci_MapOps = (function(key, value) {
  return this.updated__O__O__sci_Map(key, value);
});
function $as_sci_Map$Map2(obj) {
  return (((obj instanceof $c_sci_Map$Map2) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map$Map2"));
}
function $isArrayOf_sci_Map$Map2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map$Map2)));
}
function $asArrayOf_sci_Map$Map2(obj, depth) {
  return (($isArrayOf_sci_Map$Map2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map$Map2;", depth));
}
var $d_sci_Map$Map2 = new $TypeData().initClass($c_sci_Map$Map2, "scala.collection.immutable.Map$Map2", ({
  sci_Map$Map2: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_MapOps: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  sc_Map: 1,
  sci_Iterable: 1,
  sci_MapOps: 1,
  sci_Map: 1,
  sc_StrictOptimizedIterableOps: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sci_Map$Map3(key1, value1, key2, value2, key3, value3) {
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1 = null;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1 = null;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2 = null;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2 = null;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3 = null;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3 = null;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1 = key1;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1 = value1;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2 = key2;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2 = value2;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3 = key3;
  this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3 = value3;
}
$c_sci_Map$Map3.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map3.prototype.constructor = $c_sci_Map$Map3;
/** @constructor */
function $h_sci_Map$Map3() {
}
$h_sci_Map$Map3.prototype = $c_sci_Map$Map3.prototype;
$c_sci_Map$Map3.prototype.size__I = (function() {
  return 3;
});
$c_sci_Map$Map3.prototype.knownSize__I = (function() {
  return 3;
});
$c_sci_Map$Map3.prototype.isEmpty__Z = (function() {
  return false;
});
$c_sci_Map$Map3.prototype.apply__O__O = (function(key) {
  var y = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1;
  } else {
    var y$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2;
    } else {
      var y$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        return this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3;
      } else {
        throw new $c_ju_NoSuchElementException(("key not found: " + key));
      }
    }
  }
});
$c_sci_Map$Map3.prototype.contains__O__Z = (function(key) {
  var y = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    var $x_1 = true;
  } else {
    var y$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
    var $x_1 = $m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1);
  }
  if ($x_1) {
    return true;
  } else {
    var y$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
    return $m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2);
  }
});
$c_sci_Map$Map3.prototype.get__O__s_Option = (function(key) {
  var y = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    var value = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1;
    return new $c_s_Some(value);
  } else {
    var y$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      var value$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2;
      return new $c_s_Some(value$1);
    } else {
      var y$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        var value$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3;
        return new $c_s_Some(value$2);
      } else {
        return $m_s_None$();
      }
    }
  }
});
$c_sci_Map$Map3.prototype.getOrElse__O__F0__O = (function(key, default$1) {
  var y = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1;
  } else {
    var y$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2;
    } else {
      var y$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        return this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3;
      } else {
        return $n(default$1).apply__O();
      }
    }
  }
});
$c_sci_Map$Map3.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_Map$Map3$$anon$4(this);
});
$c_sci_Map$Map3.prototype.updated__O__O__sci_Map = (function(key, value) {
  var y = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return new $c_sci_Map$Map3(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1, value, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3);
  } else {
    var y$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return new $c_sci_Map$Map3(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2, value, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3);
    } else {
      var y$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
      return $as_sci_Map(($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2) ? new $c_sci_Map$Map3(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3, value) : new $c_sci_Map$Map4(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3, key, value)));
    }
  }
});
$c_sci_Map$Map3.prototype.forall__F1__Z = (function(p) {
  var _1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1;
  var _2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1;
  if ($uZ($n(p).apply__O__O(new $c_T2(_1, _2)))) {
    var _1$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2;
    var _2$1 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2;
    var $x_1 = $uZ($n(p).apply__O__O(new $c_T2(_1$1, _2$1)));
  } else {
    var $x_1 = false;
  }
  if ($x_1) {
    var _1$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3;
    var _2$2 = this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3;
    return $uZ($n(p).apply__O__O(new $c_T2(_1$2, _2$2)));
  } else {
    return false;
  }
});
$c_sci_Map$Map3.prototype.hashCode__I = (function() {
  var a = 0;
  var b = 0;
  var c = 1;
  var h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key1, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value1);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key2, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value2);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$key3, this.sci_Map$Map3__f_scala$collection$immutable$Map$Map3$$value3);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().s_util_hashing_MurmurHash3$__f_mapSeed;
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, a);
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, b);
  h = $m_s_util_hashing_MurmurHash3$().mixLast__I__I__I(h, c);
  return $m_s_util_hashing_MurmurHash3$().finalizeHash__I__I__I(h, 3);
});
$c_sci_Map$Map3.prototype.updated__O__O__sci_MapOps = (function(key, value) {
  return this.updated__O__O__sci_Map(key, value);
});
function $as_sci_Map$Map3(obj) {
  return (((obj instanceof $c_sci_Map$Map3) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map$Map3"));
}
function $isArrayOf_sci_Map$Map3(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map$Map3)));
}
function $asArrayOf_sci_Map$Map3(obj, depth) {
  return (($isArrayOf_sci_Map$Map3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map$Map3;", depth));
}
var $d_sci_Map$Map3 = new $TypeData().initClass($c_sci_Map$Map3, "scala.collection.immutable.Map$Map3", ({
  sci_Map$Map3: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_MapOps: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  sc_Map: 1,
  sci_Iterable: 1,
  sci_MapOps: 1,
  sci_Map: 1,
  sc_StrictOptimizedIterableOps: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sci_Map$Map4(key1, value1, key2, value2, key3, value3, key4, value4) {
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4 = null;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1 = key1;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1 = value1;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2 = key2;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2 = value2;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3 = key3;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3 = value3;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4 = key4;
  this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4 = value4;
}
$c_sci_Map$Map4.prototype = new $h_sci_AbstractMap();
$c_sci_Map$Map4.prototype.constructor = $c_sci_Map$Map4;
/** @constructor */
function $h_sci_Map$Map4() {
}
$h_sci_Map$Map4.prototype = $c_sci_Map$Map4.prototype;
$c_sci_Map$Map4.prototype.size__I = (function() {
  return 4;
});
$c_sci_Map$Map4.prototype.knownSize__I = (function() {
  return 4;
});
$c_sci_Map$Map4.prototype.isEmpty__Z = (function() {
  return false;
});
$c_sci_Map$Map4.prototype.apply__O__O = (function(key) {
  var y = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1;
  } else {
    var y$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2;
    } else {
      var y$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3;
      } else {
        var y$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
        if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$3)) {
          return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4;
        } else {
          throw new $c_ju_NoSuchElementException(("key not found: " + key));
        }
      }
    }
  }
});
$c_sci_Map$Map4.prototype.contains__O__Z = (function(key) {
  var y = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    var $x_2 = true;
  } else {
    var y$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
    var $x_2 = $m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1);
  }
  if ($x_2) {
    var $x_1 = true;
  } else {
    var y$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
    var $x_1 = $m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2);
  }
  if ($x_1) {
    return true;
  } else {
    var y$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
    return $m_sr_BoxesRunTime$().equals__O__O__Z(key, y$3);
  }
});
$c_sci_Map$Map4.prototype.get__O__s_Option = (function(key) {
  var y = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    var value = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1;
    return new $c_s_Some(value);
  } else {
    var y$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      var value$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2;
      return new $c_s_Some(value$1);
    } else {
      var y$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        var value$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3;
        return new $c_s_Some(value$2);
      } else {
        var y$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
        if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$3)) {
          var value$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4;
          return new $c_s_Some(value$3);
        } else {
          return $m_s_None$();
        }
      }
    }
  }
});
$c_sci_Map$Map4.prototype.getOrElse__O__F0__O = (function(key, default$1) {
  var y = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1;
  } else {
    var y$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2;
    } else {
      var y$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3;
      } else {
        var y$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
        if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$3)) {
          return this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4;
        } else {
          return $n(default$1).apply__O();
        }
      }
    }
  }
});
$c_sci_Map$Map4.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_Map$Map4$$anon$7(this);
});
$c_sci_Map$Map4.prototype.updated__O__O__sci_Map = (function(key, value) {
  var y = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
  if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y)) {
    return new $c_sci_Map$Map4(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, value, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4);
  } else {
    var y$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$1)) {
      return new $c_sci_Map$Map4(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, value, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4);
    } else {
      var y$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$2)) {
        return new $c_sci_Map$Map4(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, value, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4);
      } else {
        var y$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
        return $as_sci_Map(($m_sr_BoxesRunTime$().equals__O__O__Z(key, y$3) ? new $c_sci_Map$Map4(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, value) : $n($n($n($n($n($m_sci_HashMap$().sci_HashMap$__f_EmptyMap).updated__O__O__sci_HashMap(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1)).updated__O__O__sci_HashMap(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2)).updated__O__O__sci_HashMap(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3)).updated__O__O__sci_HashMap(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4)).updated__O__O__sci_HashMap(key, value)));
      }
    }
  }
});
$c_sci_Map$Map4.prototype.forall__F1__Z = (function(p) {
  var _1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1;
  var _2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1;
  if ($uZ($n(p).apply__O__O(new $c_T2(_1, _2)))) {
    var _1$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2;
    var _2$1 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2;
    var $x_2 = $uZ($n(p).apply__O__O(new $c_T2(_1$1, _2$1)));
  } else {
    var $x_2 = false;
  }
  if ($x_2) {
    var _1$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3;
    var _2$2 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3;
    var $x_1 = $uZ($n(p).apply__O__O(new $c_T2(_1$2, _2$2)));
  } else {
    var $x_1 = false;
  }
  if ($x_1) {
    var _1$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4;
    var _2$3 = this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4;
    return $uZ($n(p).apply__O__O(new $c_T2(_1$3, _2$3)));
  } else {
    return false;
  }
});
$c_sci_Map$Map4.prototype.buildTo__sci_HashMapBuilder__sci_HashMapBuilder = (function(builder) {
  return $n($n($n($n(builder).addOne__O__O__sci_HashMapBuilder(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1)).addOne__O__O__sci_HashMapBuilder(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2)).addOne__O__O__sci_HashMapBuilder(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3)).addOne__O__O__sci_HashMapBuilder(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4);
});
$c_sci_Map$Map4.prototype.hashCode__I = (function() {
  var a = 0;
  var b = 0;
  var c = 1;
  var h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key1, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value1);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key2, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value2);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key3, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value3);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().tuple2Hash__O__O__I(this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$key4, this.sci_Map$Map4__f_scala$collection$immutable$Map$Map4$$value4);
  a = ((a + h) | 0);
  b = (b ^ h);
  c = Math.imul(c, (1 | h));
  h = $m_s_util_hashing_MurmurHash3$().s_util_hashing_MurmurHash3$__f_mapSeed;
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, a);
  h = $m_s_util_hashing_MurmurHash3$().mix__I__I__I(h, b);
  h = $m_s_util_hashing_MurmurHash3$().mixLast__I__I__I(h, c);
  return $m_s_util_hashing_MurmurHash3$().finalizeHash__I__I__I(h, 4);
});
$c_sci_Map$Map4.prototype.updated__O__O__sci_MapOps = (function(key, value) {
  return this.updated__O__O__sci_Map(key, value);
});
function $as_sci_Map$Map4(obj) {
  return (((obj instanceof $c_sci_Map$Map4) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Map$Map4"));
}
function $isArrayOf_sci_Map$Map4(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Map$Map4)));
}
function $asArrayOf_sci_Map$Map4(obj, depth) {
  return (($isArrayOf_sci_Map$Map4(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Map$Map4;", depth));
}
var $d_sci_Map$Map4 = new $TypeData().initClass($c_sci_Map$Map4, "scala.collection.immutable.Map$Map4", ({
  sci_Map$Map4: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_MapOps: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  sc_Map: 1,
  sci_Iterable: 1,
  sci_MapOps: 1,
  sci_Map: 1,
  sc_StrictOptimizedIterableOps: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sjsr_WrappedVarArgs(array) {
  this.sjsr_WrappedVarArgs__f_scala$scalajs$runtime$WrappedVarArgs$$array = null;
  this.sjsr_WrappedVarArgs__f_scala$scalajs$runtime$WrappedVarArgs$$array = array;
}
$c_sjsr_WrappedVarArgs.prototype = new $h_O();
$c_sjsr_WrappedVarArgs.prototype.constructor = $c_sjsr_WrappedVarArgs;
/** @constructor */
function $h_sjsr_WrappedVarArgs() {
}
$h_sjsr_WrappedVarArgs.prototype = $c_sjsr_WrappedVarArgs.prototype;
$c_sjsr_WrappedVarArgs.prototype.canEqual__O__Z = (function(that) {
  return $f_sci_IndexedSeq__canEqual__O__Z(this, that);
});
$c_sjsr_WrappedVarArgs.prototype.sameElements__sc_IterableOnce__Z = (function(o) {
  return $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z(this, o);
});
$c_sjsr_WrappedVarArgs.prototype.applyPreferredMaxLength__I = (function() {
  return $m_sci_IndexedSeqDefaults$().sci_IndexedSeqDefaults$__f_defaultApplyPreferredMaxLength;
});
$c_sjsr_WrappedVarArgs.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_IndexedSeqView$Id(this);
  return $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this$1);
});
$c_sjsr_WrappedVarArgs.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_sjsr_WrappedVarArgs.prototype.knownSize__I = (function() {
  return this.length__I();
});
$c_sjsr_WrappedVarArgs.prototype.equals__O__Z = (function(o) {
  return $f_sc_Seq__equals__O__Z(this, o);
});
$c_sjsr_WrappedVarArgs.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this);
});
$c_sjsr_WrappedVarArgs.prototype.toString__T = (function() {
  return $f_sc_Iterable__toString__T(this);
});
$c_sjsr_WrappedVarArgs.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqOps__isEmpty__Z(this);
});
$c_sjsr_WrappedVarArgs.prototype.foreach__F1__V = (function(f) {
  $f_sc_IterableOnceOps__foreach__F1__V(this, f);
});
$c_sjsr_WrappedVarArgs.prototype.copyToArray__O__I__I__I = (function(dest, start, n) {
  return $f_sc_IterableOnceOps__copyToArray__O__I__I__I(this, dest, start, n);
});
$c_sjsr_WrappedVarArgs.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_IterableOnceOps__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end);
});
$c_sjsr_WrappedVarArgs.prototype.length__I = (function() {
  return $uI(this.sjsr_WrappedVarArgs__f_scala$scalajs$runtime$WrappedVarArgs$$array.length);
});
$c_sjsr_WrappedVarArgs.prototype.apply__I__O = (function(idx) {
  return this.sjsr_WrappedVarArgs__f_scala$scalajs$runtime$WrappedVarArgs$$array[idx];
});
$c_sjsr_WrappedVarArgs.prototype.className__T = (function() {
  return "WrappedVarArgs";
});
$c_sjsr_WrappedVarArgs.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1));
});
function $as_sjsr_WrappedVarArgs(obj) {
  return (((obj instanceof $c_sjsr_WrappedVarArgs) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.WrappedVarArgs"));
}
function $isArrayOf_sjsr_WrappedVarArgs(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_WrappedVarArgs)));
}
function $asArrayOf_sjsr_WrappedVarArgs(obj, depth) {
  return (($isArrayOf_sjsr_WrappedVarArgs(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.WrappedVarArgs;", depth));
}
var $d_sjsr_WrappedVarArgs = new $TypeData().initClass($c_sjsr_WrappedVarArgs, "scala.scalajs.runtime.WrappedVarArgs", ({
  sjsr_WrappedVarArgs: 1,
  sci_IndexedSeq: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  sci_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sci_HashMap(rootNode) {
  this.sci_HashMap__f_rootNode = null;
  this.sci_HashMap__f_rootNode = rootNode;
}
$c_sci_HashMap.prototype = new $h_sci_AbstractMap();
$c_sci_HashMap.prototype.constructor = $c_sci_HashMap;
/** @constructor */
function $h_sci_HashMap() {
}
$h_sci_HashMap.prototype = $c_sci_HashMap.prototype;
$c_sci_HashMap.prototype.knownSize__I = (function() {
  return $n(this.sci_HashMap__f_rootNode).sci_BitmapIndexedMapNode__f_size;
});
$c_sci_HashMap.prototype.size__I = (function() {
  return $n(this.sci_HashMap__f_rootNode).sci_BitmapIndexedMapNode__f_size;
});
$c_sci_HashMap.prototype.isEmpty__Z = (function() {
  return ($n(this.sci_HashMap__f_rootNode).sci_BitmapIndexedMapNode__f_size === 0);
});
$c_sci_HashMap.prototype.iterator__sc_Iterator = (function() {
  return (this.isEmpty__Z() ? $m_sc_Iterator$().sc_Iterator$__f__empty : new $c_sci_MapKeyValueTupleIterator(this.sci_HashMap__f_rootNode));
});
$c_sci_HashMap.prototype.contains__O__Z = (function(key) {
  var keyUnimprovedHash = $m_sr_Statics$().anyHash__O__I(key);
  var keyHash = $m_sc_Hashing$().improve__I__I(keyUnimprovedHash);
  return $n(this.sci_HashMap__f_rootNode).containsKey__O__I__I__I__Z(key, keyUnimprovedHash, keyHash, 0);
});
$c_sci_HashMap.prototype.apply__O__O = (function(key) {
  var keyUnimprovedHash = $m_sr_Statics$().anyHash__O__I(key);
  var keyHash = $m_sc_Hashing$().improve__I__I(keyUnimprovedHash);
  return $n(this.sci_HashMap__f_rootNode).apply__O__I__I__I__O(key, keyUnimprovedHash, keyHash, 0);
});
$c_sci_HashMap.prototype.get__O__s_Option = (function(key) {
  var keyUnimprovedHash = $m_sr_Statics$().anyHash__O__I(key);
  var keyHash = $m_sc_Hashing$().improve__I__I(keyUnimprovedHash);
  return $n(this.sci_HashMap__f_rootNode).get__O__I__I__I__s_Option(key, keyUnimprovedHash, keyHash, 0);
});
$c_sci_HashMap.prototype.getOrElse__O__F0__O = (function(key, default$1) {
  var keyUnimprovedHash = $m_sr_Statics$().anyHash__O__I(key);
  var keyHash = $m_sc_Hashing$().improve__I__I(keyUnimprovedHash);
  return $n(this.sci_HashMap__f_rootNode).getOrElse__O__I__I__I__F0__O(key, keyUnimprovedHash, keyHash, 0, default$1);
});
$c_sci_HashMap.prototype.updated__O__O__sci_HashMap = (function(key, value) {
  var keyUnimprovedHash = $m_sr_Statics$().anyHash__O__I(key);
  var newRootNode = $n(this.sci_HashMap__f_rootNode).updated__O__O__I__I__I__Z__sci_BitmapIndexedMapNode(key, value, keyUnimprovedHash, $m_sc_Hashing$().improve__I__I(keyUnimprovedHash), 0, true);
  return ((newRootNode === this.sci_HashMap__f_rootNode) ? this : new $c_sci_HashMap(newRootNode));
});
$c_sci_HashMap.prototype.foreachEntry__F2__V = (function(f) {
  $n(this.sci_HashMap__f_rootNode).foreachEntry__F2__V(f);
});
$c_sci_HashMap.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_sci_HashMap)) {
    var map = $as_sci_HashMap(that);
    if ((this === map)) {
      return true;
    } else {
      var x = this.sci_HashMap__f_rootNode;
      var x$2 = $n(map).sci_HashMap__f_rootNode;
      return ((x === null) ? (x$2 === null) : $n(x).equals__O__Z(x$2));
    }
  } else {
    return $f_sc_Map__equals__O__Z(this, that);
  }
});
$c_sci_HashMap.prototype.hashCode__I = (function() {
  if (this.isEmpty__Z()) {
    return $m_s_util_hashing_MurmurHash3$().s_util_hashing_MurmurHash3$__f_emptyMapHash;
  } else {
    var hashIterator = new $c_sci_MapKeyValueTupleHashIterator(this.sci_HashMap__f_rootNode);
    var hash = $m_s_util_hashing_MurmurHash3$().unorderedHash__sc_IterableOnce__I__I(hashIterator, $m_s_util_hashing_MurmurHash3$().s_util_hashing_MurmurHash3$__f_mapSeed);
    return hash;
  }
});
$c_sci_HashMap.prototype.className__T = (function() {
  return "HashMap";
});
$c_sci_HashMap.prototype.updated__O__O__sci_MapOps = (function(key, value) {
  return this.updated__O__O__sci_HashMap(key, value);
});
function $as_sci_HashMap(obj) {
  return (((obj instanceof $c_sci_HashMap) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap"));
}
function $isArrayOf_sci_HashMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap)));
}
function $asArrayOf_sci_HashMap(obj, depth) {
  return (($isArrayOf_sci_HashMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap;", depth));
}
var $d_sci_HashMap = new $TypeData().initClass($c_sci_HashMap, "scala.collection.immutable.HashMap", ({
  sci_HashMap: 1,
  sci_AbstractMap: 1,
  sc_AbstractMap: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_MapOps: 1,
  sc_MapFactoryDefaults: 1,
  s_Equals: 1,
  sc_Map: 1,
  sci_Iterable: 1,
  sci_MapOps: 1,
  sci_Map: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedMapOps: 1,
  sci_StrictOptimizedMapOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
function $as_sci_TreeSeqMap(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.TreeSeqMap"));
}
function $isArrayOf_sci_TreeSeqMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_TreeSeqMap)));
}
function $asArrayOf_sci_TreeSeqMap(obj, depth) {
  return (($isArrayOf_sci_TreeSeqMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.TreeSeqMap;", depth));
}
function $as_sci_VectorMap(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorMap"));
}
function $isArrayOf_sci_VectorMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorMap)));
}
function $asArrayOf_sci_VectorMap(obj, depth) {
  return (($isArrayOf_sci_VectorMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorMap;", depth));
}
/** @constructor */
function $c_scm_AbstractBuffer() {
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.addAll__sc_IterableOnce__scm_Growable = (function(elems) {
  return $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, elems);
});
function $as_sci_ListMap(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ListMap"));
}
function $isArrayOf_sci_ListMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ListMap)));
}
function $asArrayOf_sci_ListMap(obj, depth) {
  return (($isArrayOf_sci_ListMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ListMap;", depth));
}
/** @constructor */
function $c_sci_ArraySeq() {
}
$c_sci_ArraySeq.prototype = new $h_sci_AbstractSeq();
$c_sci_ArraySeq.prototype.constructor = $c_sci_ArraySeq;
/** @constructor */
function $h_sci_ArraySeq() {
}
$h_sci_ArraySeq.prototype = $c_sci_ArraySeq.prototype;
$c_sci_ArraySeq.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_sci_ArraySeq.prototype.knownSize__I = (function() {
  return this.length__I();
});
$c_sci_ArraySeq.prototype.stringPrefix__T = (function() {
  return "IndexedSeq";
});
$c_sci_ArraySeq.prototype.canEqual__O__Z = (function(that) {
  return $f_sci_IndexedSeq__canEqual__O__Z(this, that);
});
$c_sci_ArraySeq.prototype.sameElements__sc_IterableOnce__Z = (function(o) {
  return $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z(this, o);
});
$c_sci_ArraySeq.prototype.className__T = (function() {
  return "ArraySeq";
});
$c_sci_ArraySeq.prototype.copyToArray__O__I__I__I = (function(xs, start, len) {
  var srcLen = this.length__I();
  var destLen = $m_jl_reflect_Array$().getLength__O__I(xs);
  var limit = ((len < srcLen) ? len : srcLen);
  var capacity = ((start < 0) ? destLen : ((destLen - start) | 0));
  var total = ((capacity < limit) ? capacity : limit);
  var copied = ((total < 0) ? 0 : total);
  if ((copied > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.unsafeArray__O(), 0, xs, start, copied);
  }
  return copied;
});
$c_sci_ArraySeq.prototype.applyPreferredMaxLength__I = (function() {
  return 2147483647;
});
function $ct_sci_Vector__AO__($thiz, prefix1) {
  $thiz.sci_Vector__f_prefix1 = prefix1;
  return $thiz;
}
/** @constructor */
function $c_sci_Vector() {
  this.sci_Vector__f_prefix1 = null;
}
$c_sci_Vector.prototype = new $h_sci_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  var x = this.length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_sci_Vector.prototype.knownSize__I = (function() {
  return this.length__I();
});
$c_sci_Vector.prototype.stringPrefix__T = (function() {
  return "IndexedSeq";
});
$c_sci_Vector.prototype.canEqual__O__Z = (function(that) {
  return $f_sci_IndexedSeq__canEqual__O__Z(this, that);
});
$c_sci_Vector.prototype.sameElements__sc_IterableOnce__Z = (function(o) {
  return $f_sci_IndexedSeq__sameElements__sc_IterableOnce__Z(this, o);
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this instanceof $c_sci_BigVector) ? $n($as_sci_BigVector(this)).sci_BigVector__f_length0 : $n(this.sci_Vector__f_prefix1).u.length);
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return ((this === $m_sci_Vector0$()) ? $m_sci_Vector$().sci_Vector$__f_scala$collection$immutable$Vector$$$emptyIterator : new $c_sci_NewVectorIterator(this, this.length__I(), this.vectorSliceCount__I()));
});
$c_sci_Vector.prototype.className__T = (function() {
  return "Vector";
});
$c_sci_Vector.prototype.copyToArray__O__I__I__I = (function(xs, start, len) {
  return $n(this.iterator__sc_Iterator()).copyToArray__O__I__I__I(xs, start, len);
});
$c_sci_Vector.prototype.applyPreferredMaxLength__I = (function() {
  return $m_sci_Vector$().sci_Vector$__f_scala$collection$immutable$Vector$$$defaultApplyPreferredMaxLength;
});
$c_sci_Vector.prototype.ioob__I__jl_IndexOutOfBoundsException = (function(index) {
  return $m_scg_CommonErrors$().indexOutOfBounds__I__I__jl_IndexOutOfBoundsException(index, ((this.length__I() - 1) | 0));
});
$c_sci_Vector.prototype.foreach__F1__V = (function(f) {
  var c = this.vectorSliceCount__I();
  var i = 0;
  while ((i < c)) {
    var $x_1 = $m_sci_VectorStatics$();
    var idx = i;
    var c$1 = (((c + ((c >>> 31) | 0)) | 0) >> 1);
    var a = ((idx - c$1) | 0);
    var sign = (a >> 31);
    $x_1.foreachRec__I__AO__F1__V(((((((1 + c$1) | 0) - (((a ^ sign) - sign) | 0)) | 0) - 1) | 0), this.vectorSlice__I__AO(i), f);
    i = ((1 + i) | 0);
  }
});
function $as_sci_Vector(obj) {
  return (((obj instanceof $c_sci_Vector) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector"));
}
function $isArrayOf_sci_Vector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector)));
}
function $asArrayOf_sci_Vector(obj, depth) {
  return (($isArrayOf_sci_Vector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector;", depth));
}
/** @constructor */
function $c_sci_ArraySeq$ofBoolean(unsafeArray) {
  this.sci_ArraySeq$ofBoolean__f_unsafeArray = null;
  this.sci_ArraySeq$ofBoolean__f_unsafeArray = unsafeArray;
}
$c_sci_ArraySeq$ofBoolean.prototype = new $h_sci_ArraySeq();
$c_sci_ArraySeq$ofBoolean.prototype.constructor = $c_sci_ArraySeq$ofBoolean;
/** @constructor */
function $h_sci_ArraySeq$ofBoolean() {
}
$h_sci_ArraySeq$ofBoolean.prototype = $c_sci_ArraySeq$ofBoolean.prototype;
$c_sci_ArraySeq$ofBoolean.prototype.length__I = (function() {
  return $n(this.sci_ArraySeq$ofBoolean__f_unsafeArray).u.length;
});
$c_sci_ArraySeq$ofBoolean.prototype.apply__I__Z = (function(i) {
  return $n(this.sci_ArraySeq$ofBoolean__f_unsafeArray).get(i);
});
$c_sci_ArraySeq$ofBoolean.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.sci_ArraySeq$ofBoolean__f_unsafeArray;
  return this$1.arrayHash__O__I__I(a, this$1.s_util_hashing_MurmurHash3$__f_seqSeed);
});
$c_sci_ArraySeq$ofBoolean.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_sci_ArraySeq$ofBoolean)) {
    var that$2 = $as_sci_ArraySeq$ofBoolean(that);
    var a = this.sci_ArraySeq$ofBoolean__f_unsafeArray;
    var b = $n(that$2).sci_ArraySeq$ofBoolean__f_unsafeArray;
    return $m_ju_Arrays$().equals__AZ__AZ__Z(a, b);
  } else {
    return $f_sc_Seq__equals__O__Z(this, that);
  }
});
$c_sci_ArraySeq$ofBoolean.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_ArrayOps$ArrayIterator(this.sci_ArraySeq$ofBoolean__f_unsafeArray);
});
$c_sci_ArraySeq$ofBoolean.prototype.unsafeArray__O = (function() {
  return this.sci_ArraySeq$ofBoolean__f_unsafeArray;
});
$c_sci_ArraySeq$ofBoolean.prototype.apply__I__O = (function(i) {
  return this.apply__I__Z(i);
});
$c_sci_ArraySeq$ofBoolean.prototype.apply__O__O = (function(v1) {
  return this.apply__I__Z($uI(v1));
});
function $as_sci_ArraySeq$ofBoolean(obj) {
  return (((obj instanceof $c_sci_ArraySeq$ofBoolean) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ArraySeq$ofBoolean"));
}
function $isArrayOf_sci_ArraySeq$ofBoolean(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ArraySeq$ofBoolean)));
}
function $asArrayOf_sci_ArraySeq$ofBoolean(obj, depth) {
  return (($isArrayOf_sci_ArraySeq$ofBoolean(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ArraySeq$ofBoolean;", depth));
}
var $d_sci_ArraySeq$ofBoolean = new $TypeData().initClass($c_sci_ArraySeq$ofBoolean, "scala.collection.immutable.ArraySeq$ofBoolean", ({
  sci_ArraySeq$ofBoolean: 1,
  sci_ArraySeq: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_EvidenceIterableFactoryDefaults: 1,
  Ljava_io_Serializable: 1
}));
/** @constructor */
function $c_sci_ArraySeq$ofDouble(unsafeArray) {
  this.sci_ArraySeq$ofDouble__f_unsafeArray = null;
  this.sci_ArraySeq$ofDouble__f_unsafeArray = unsafeArray;
}
$c_sci_ArraySeq$ofDouble.prototype = new $h_sci_ArraySeq();
$c_sci_ArraySeq$ofDouble.prototype.constructor = $c_sci_ArraySeq$ofDouble;
/** @constructor */
function $h_sci_ArraySeq$ofDouble() {
}
$h_sci_ArraySeq$ofDouble.prototype = $c_sci_ArraySeq$ofDouble.prototype;
$c_sci_ArraySeq$ofDouble.prototype.length__I = (function() {
  return $n(this.sci_ArraySeq$ofDouble__f_unsafeArray).u.length;
});
$c_sci_ArraySeq$ofDouble.prototype.apply__I__D = (function(i) {
  return $n(this.sci_ArraySeq$ofDouble__f_unsafeArray).get(i);
});
$c_sci_ArraySeq$ofDouble.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  var a = this.sci_ArraySeq$ofDouble__f_unsafeArray;
  return this$1.arrayHash__O__I__I(a, this$1.s_util_hashing_MurmurHash3$__f_seqSeed);
});
$c_sci_ArraySeq$ofDouble.prototype.equals__O__Z = (function(that) {
  if ((that instanceof $c_sci_ArraySeq$ofDouble)) {
    var that$2 = $as_sci_ArraySeq$ofDouble(that);
    var array = this.sci_ArraySeq$ofDouble__f_unsafeArray;
    var thatArray = $n(that$2).sci_ArraySeq$ofDouble__f_unsafeArray;
    if ((array === thatArray)) {
      return true;
    } else if (($n(array).u.length === $n(thatArray).u.length)) {
      var i = 0;
      while (((i < $n(array).u.length) && ($n(array).get(i) === $n(thatArray).get(i)))) {
        i = ((1 + i) | 0);
      }
      return (i >= $n(array).u.length);
    } else {
      return false;
    }
  } else {
    return $f_sc_Seq__equals__O__Z(this, that);
  }
});
$c_sci_ArraySeq$ofDouble.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_ArrayOps$ArrayIterator(this.sci_ArraySeq$ofDouble__f_unsafeArray);
});
$c_sci_ArraySeq$ofDouble.prototype.unsafeArray__O = (function() {
  return this.sci_ArraySeq$ofDouble__f_unsafeArray;
});
$c_sci_ArraySeq$ofDouble.prototype.apply__I__O = (function(i) {
  return this.apply__I__D(i);
});
$c_sci_ArraySeq$ofDouble.prototype.apply__O__O = (function(v1) {
  return this.apply__I__D($uI(v1));
});
function $as_sci_ArraySeq$ofDouble(obj) {
  return (((obj instanceof $c_sci_ArraySeq$ofDouble) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ArraySeq$ofDouble"));
}
function $isArrayOf_sci_ArraySeq$ofDouble(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ArraySeq$ofDouble)));
}
function $asArrayOf_sci_ArraySeq$ofDouble(obj, depth) {
  return (($isArrayOf_sci_ArraySeq$ofDouble(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ArraySeq$ofDouble;", depth));
}
var $d_sci_ArraySeq$ofDouble = new $TypeData().initClass($c_sci_ArraySeq$ofDouble, "scala.collection.immutable.ArraySeq$ofDouble", ({
  sci_ArraySeq$ofDouble: 1,
  sci_ArraySeq: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  sc_EvidenceIterableFactoryDefaults: 1,
  Ljava_io_Serializable: 1
}));
function $as_sci_ArraySeq$ofRef(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.ArraySeq$ofRef"));
}
function $isArrayOf_sci_ArraySeq$ofRef(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_ArraySeq$ofRef)));
}
function $asArrayOf_sci_ArraySeq$ofRef(obj, depth) {
  return (($isArrayOf_sci_ArraySeq$ofRef(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.ArraySeq$ofRef;", depth));
}
function $p_sci_List__loop$2__I__I__sci_List__I($thiz, len$1, i, xs) {
  var xs$tailLocal1 = xs;
  var i$tailLocal1 = i;
  while (true) {
    if ((i$tailLocal1 === len$1)) {
      return ((!$n(xs$tailLocal1).isEmpty__Z()) | 0);
    } else {
      if ((!$n(xs$tailLocal1).isEmpty__Z())) {
        var i$tailLocal1$tmp1 = ((1 + i$tailLocal1) | 0);
        var xs$tailLocal1$tmp1 = $as_sci_List($n(xs$tailLocal1).tail__O());
        i$tailLocal1 = i$tailLocal1$tmp1;
        xs$tailLocal1 = xs$tailLocal1$tmp1;
        continue;
      }
      return (-1);
    }
  }
}
function $p_sci_List__listEq$1__sci_List__sci_List__Z($thiz, a, b) {
  var b$tailLocal1 = b;
  var a$tailLocal1 = a;
  while (true) {
    if ((a$tailLocal1 === b$tailLocal1)) {
      return true;
    } else {
      var aEmpty = $n(a$tailLocal1).isEmpty__Z();
      var bEmpty = $n(b$tailLocal1).isEmpty__Z();
      if ((!(aEmpty || bEmpty))) {
        var x = $n(a$tailLocal1).head__O();
        var y = $n(b$tailLocal1).head__O();
        var $x_1 = $m_sr_BoxesRunTime$().equals__O__O__Z(x, y);
      } else {
        var $x_1 = false;
      }
      if ($x_1) {
        var a$tailLocal1$tmp1 = $as_sci_List($n(a$tailLocal1).tail__O());
        var b$tailLocal1$tmp1 = $as_sci_List($n(b$tailLocal1).tail__O());
        a$tailLocal1 = a$tailLocal1$tmp1;
        b$tailLocal1 = b$tailLocal1$tmp1;
        continue;
      }
      return (aEmpty && bEmpty);
    }
  }
}
/** @constructor */
function $c_sci_List() {
}
$c_sci_List.prototype = new $h_sci_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.apply__I__O = (function(n) {
  return $f_sc_LinearSeqOps__apply__I__O(this, n);
});
$c_sci_List.prototype.sameElements__sc_IterableOnce__Z = (function(that) {
  return $f_sc_LinearSeqOps__sameElements__sc_IterableOnce__Z(this, that);
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "LinearSeq";
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_StrictOptimizedLinearSeqOps$$anon$1(this);
});
$c_sci_List.prototype.$colon$colon$colon__sci_List__sci_List = (function(prefix) {
  if (this.isEmpty__Z()) {
    return prefix;
  } else if ($n(prefix).isEmpty__Z()) {
    return this;
  } else {
    var result = new $c_sci_$colon$colon($n(prefix).head__O(), this);
    var curr = result;
    var that = $as_sci_List($n(prefix).tail__O());
    while ((!$n(that).isEmpty__Z())) {
      var temp = new $c_sci_$colon$colon($n(that).head__O(), this);
      $n(curr).sci_$colon$colon__f_next = temp;
      curr = temp;
      that = $as_sci_List($n(that).tail__O());
    }
    return result;
  }
});
$c_sci_List.prototype.isEmpty__Z = (function() {
  return (this === $m_sci_Nil$());
});
$c_sci_List.prototype.prependedAll__sc_IterableOnce__sci_List = (function(prefix) {
  if ((prefix instanceof $c_sci_List)) {
    var xs = $as_sci_List(prefix);
    return this.$colon$colon$colon__sci_List__sci_List(xs);
  }
  if (($n(prefix).knownSize__I() === 0)) {
    return this;
  }
  if (false) {
    var b = $as_scm_ListBuffer(prefix);
    if (this.isEmpty__Z()) {
      return $n(b).toList__sci_List();
    }
  }
  var iter = $n(prefix).iterator__sc_Iterator();
  if ($n(iter).hasNext__Z()) {
    var result = new $c_sci_$colon$colon($n(iter).next__O(), this);
    var curr = result;
    while ($n(iter).hasNext__Z()) {
      var temp = new $c_sci_$colon$colon($n(iter).next__O(), this);
      $n(curr).sci_$colon$colon__f_next = temp;
      curr = temp;
    }
    return result;
  } else {
    return this;
  }
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!$n(these).isEmpty__Z())) {
    $n(f).apply__O__O($n(these).head__O());
    these = $as_sci_List($n(these).tail__O());
  }
});
$c_sci_List.prototype.length__I = (function() {
  var these = this;
  var len = 0;
  while ((!$n(these).isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sci_List($n(these).tail__O());
  }
  return len;
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return ((len < 0) ? 1 : $p_sci_List__loop$2__I__I__sci_List__I(this, len, 0, this));
});
$c_sci_List.prototype.className__T = (function() {
  return "List";
});
$c_sci_List.prototype.equals__O__Z = (function(o) {
  if ((o instanceof $c_sci_List)) {
    var that = $as_sci_List(o);
    return $p_sci_List__listEq$1__sci_List__sci_List__Z(this, this, that);
  } else {
    return $f_sc_Seq__equals__O__Z(this, o);
  }
});
$c_sci_List.prototype.drop__I__O = (function(n) {
  return $p_sc_StrictOptimizedLinearSeqOps__loop$2__I__sc_LinearSeq__sc_LinearSeq(this, n, this);
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOps__apply__I__O(this, n);
});
function $as_sci_List(obj) {
  return (((obj instanceof $c_sci_List) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"));
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)));
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth));
}
/** @constructor */
function $c_sci_VectorImpl() {
  this.sci_Vector__f_prefix1 = null;
}
$c_sci_VectorImpl.prototype = new $h_sci_Vector();
$c_sci_VectorImpl.prototype.constructor = $c_sci_VectorImpl;
/** @constructor */
function $h_sci_VectorImpl() {
}
$h_sci_VectorImpl.prototype = $c_sci_VectorImpl.prototype;
function $as_scm_HashMap(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.HashMap"));
}
function $isArrayOf_scm_HashMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_HashMap)));
}
function $asArrayOf_scm_HashMap(obj, depth) {
  return (($isArrayOf_scm_HashMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.HashMap;", depth));
}
function $ct_sci_BigVector__AO__AO__I__($thiz, _prefix1, suffix1, length0) {
  $thiz.sci_BigVector__f_suffix1 = suffix1;
  $thiz.sci_BigVector__f_length0 = length0;
  $ct_sci_Vector__AO__($thiz, _prefix1);
  return $thiz;
}
/** @constructor */
function $c_sci_BigVector() {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
}
$c_sci_BigVector.prototype = new $h_sci_VectorImpl();
$c_sci_BigVector.prototype.constructor = $c_sci_BigVector;
/** @constructor */
function $h_sci_BigVector() {
}
$h_sci_BigVector.prototype = $c_sci_BigVector.prototype;
function $as_sci_BigVector(obj) {
  return (((obj instanceof $c_sci_BigVector) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.BigVector"));
}
function $isArrayOf_sci_BigVector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_BigVector)));
}
function $asArrayOf_sci_BigVector(obj, depth) {
  return (($isArrayOf_sci_BigVector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.BigVector;", depth));
}
/** @constructor */
function $c_sci_Vector1(_data1) {
  this.sci_Vector__f_prefix1 = null;
  $ct_sci_Vector__AO__(this, _data1);
}
$c_sci_Vector1.prototype = new $h_sci_VectorImpl();
$c_sci_Vector1.prototype.constructor = $c_sci_Vector1;
/** @constructor */
function $h_sci_Vector1() {
}
$h_sci_Vector1.prototype = $c_sci_Vector1.prototype;
$c_sci_Vector1.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < $n(this.sci_Vector__f_prefix1).u.length))) {
    return $n(this.sci_Vector__f_prefix1).get(index);
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector1.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  if (((index >= 0) && (index < $n(this.sci_Vector__f_prefix1).u.length))) {
    var a1 = this.sci_Vector__f_prefix1;
    var this$2 = $n(a1);
    var a1c = this$2.clone__O();
    a1c.set(index, elem);
    return new $c_sci_Vector1(a1c);
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector1.prototype.appended__O__sci_Vector = (function(elem) {
  var len1 = $n(this.sci_Vector__f_prefix1).u.length;
  if ((len1 < 32)) {
    return new $c_sci_Vector1($m_sci_VectorStatics$().copyAppend1__AO__O__AO(this.sci_Vector__f_prefix1, elem));
  } else {
    var $x_2 = this.sci_Vector__f_prefix1;
    var $x_1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    var a = new $ac_O(1);
    a.set(0, elem);
    return new $c_sci_Vector2($x_2, 32, $x_1, a, 33);
  }
});
$c_sci_Vector1.prototype.vectorSliceCount__I = (function() {
  return 1;
});
$c_sci_Vector1.prototype.vectorSlice__I__AO = (function(idx) {
  return this.sci_Vector__f_prefix1;
});
$c_sci_Vector1.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < $n(this.sci_Vector__f_prefix1).u.length))) {
    return $n(this.sci_Vector__f_prefix1).get(index);
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
function $as_sci_Vector1(obj) {
  return (((obj instanceof $c_sci_Vector1) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector1"));
}
function $isArrayOf_sci_Vector1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector1)));
}
function $asArrayOf_sci_Vector1(obj, depth) {
  return (($isArrayOf_sci_Vector1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector1;", depth));
}
var $d_sci_Vector1 = new $TypeData().initClass($c_sci_Vector1, "scala.collection.immutable.Vector1", ({
  sci_Vector1: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
/** @constructor */
function $c_sci_$colon$colon(head, next) {
  this.sci_$colon$colon__f_head = null;
  this.sci_$colon$colon__f_next = null;
  this.sci_$colon$colon__f_head = head;
  this.sci_$colon$colon__f_next = next;
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_s_Product$$anon$1(this);
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2;
});
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::";
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(n) {
  if ((n === 0)) {
    return this.sci_$colon$colon__f_head;
  }
  if ((n === 1)) {
    return this.sci_$colon$colon__f_next;
  }
  throw $ct_jl_IndexOutOfBoundsException__I__(new $c_jl_IndexOutOfBoundsException(), n);
});
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.sci_$colon$colon__f_head;
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.sci_$colon$colon__f_next;
});
var $d_sci_$colon$colon = new $TypeData().initClass($c_sci_$colon$colon, "scala.collection.immutable.$colon$colon", ({
  sci_$colon$colon: 1,
  sci_List: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_LinearSeqOps: 1,
  sc_LinearSeq: 1,
  sci_LinearSeqOps: 1,
  sci_LinearSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedLinearSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1,
  s_Product: 1
}));
/** @constructor */
function $c_sci_Nil$() {
  $n_sci_Nil$ = this;
  var _1 = $m_sci_Nil$();
  $m_sci_Nil$();
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_s_Product$$anon$1(this);
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0;
});
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil";
});
$c_sci_Nil$.prototype.productElement__I__O = (function(n) {
  throw $ct_jl_IndexOutOfBoundsException__I__(new $c_jl_IndexOutOfBoundsException(), n);
});
$c_sci_Nil$.prototype.head__E = (function() {
  throw new $c_ju_NoSuchElementException("head of empty list");
});
$c_sci_Nil$.prototype.tail__E = (function() {
  throw new $c_jl_UnsupportedOperationException("tail of empty list");
});
$c_sci_Nil$.prototype.knownSize__I = (function() {
  return 0;
});
$c_sci_Nil$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().sc_Iterator$__f__empty;
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__E();
});
$c_sci_Nil$.prototype.tail__O = (function() {
  this.tail__E();
});
var $d_sci_Nil$ = new $TypeData().initClass($c_sci_Nil$, "scala.collection.immutable.Nil$", ({
  sci_Nil$: 1,
  sci_List: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_LinearSeqOps: 1,
  sc_LinearSeq: 1,
  sci_LinearSeqOps: 1,
  sci_LinearSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedLinearSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1,
  s_Product: 1
}));
var $n_sci_Nil$;
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$();
  }
  return $n_sci_Nil$;
}
/** @constructor */
function $c_sci_Vector0$() {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
  $ct_sci_BigVector__AO__AO__I__(this, $m_sci_VectorStatics$().sci_VectorStatics$__f_empty1, $m_sci_VectorStatics$().sci_VectorStatics$__f_empty1, 0);
}
$c_sci_Vector0$.prototype = new $h_sci_BigVector();
$c_sci_Vector0$.prototype.constructor = $c_sci_Vector0$;
/** @constructor */
function $h_sci_Vector0$() {
}
$h_sci_Vector0$.prototype = $c_sci_Vector0$.prototype;
$c_sci_Vector0$.prototype.apply__I__E = (function(index) {
  throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
});
$c_sci_Vector0$.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
});
$c_sci_Vector0$.prototype.appended__O__sci_Vector = (function(elem) {
  var a = new $ac_O(1);
  a.set(0, elem);
  return new $c_sci_Vector1(a);
});
$c_sci_Vector0$.prototype.vectorSliceCount__I = (function() {
  return 0;
});
$c_sci_Vector0$.prototype.vectorSlice__I__AO = (function(idx) {
  return null;
});
$c_sci_Vector0$.prototype.equals__O__Z = (function(o) {
  return ((this === o) || ((o instanceof $c_sci_Vector) ? ($as_sci_Vector(o), false) : $f_sc_Seq__equals__O__Z(this, o)));
});
$c_sci_Vector0$.prototype.ioob__I__jl_IndexOutOfBoundsException = (function(index) {
  return $ct_jl_IndexOutOfBoundsException__T__(new $c_jl_IndexOutOfBoundsException(), (index + " is out of bounds (empty vector)"));
});
$c_sci_Vector0$.prototype.apply__I__O = (function(i) {
  this.apply__I__E(i);
});
$c_sci_Vector0$.prototype.apply__O__O = (function(v1) {
  this.apply__I__E($uI(v1));
});
var $d_sci_Vector0$ = new $TypeData().initClass($c_sci_Vector0$, "scala.collection.immutable.Vector0$", ({
  sci_Vector0$: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
var $n_sci_Vector0$;
function $m_sci_Vector0$() {
  if ((!$n_sci_Vector0$)) {
    $n_sci_Vector0$ = new $c_sci_Vector0$();
  }
  return $n_sci_Vector0$;
}
/** @constructor */
function $c_sci_Vector2(_prefix1, len1, data2, _suffix1, _length0) {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
  this.sci_Vector2__f_len1 = 0;
  this.sci_Vector2__f_data2 = null;
  this.sci_Vector2__f_len1 = len1;
  this.sci_Vector2__f_data2 = data2;
  $ct_sci_BigVector__AO__AO__I__(this, _prefix1, _suffix1, _length0);
}
$c_sci_Vector2.prototype = new $h_sci_BigVector();
$c_sci_Vector2.prototype.constructor = $c_sci_Vector2;
/** @constructor */
function $h_sci_Vector2() {
}
$h_sci_Vector2.prototype = $c_sci_Vector2.prototype;
$c_sci_Vector2.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector2__f_len1) | 0);
    if ((io >= 0)) {
      var i2 = ((io >>> 5) | 0);
      var i1 = (31 & io);
      return ((i2 < $n(this.sci_Vector2__f_data2).u.length) ? $n($n(this.sci_Vector2__f_data2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get((31 & io)));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector2.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    if ((index >= this.sci_Vector2__f_len1)) {
      var io = ((index - this.sci_Vector2__f_len1) | 0);
      var i2 = ((io >>> 5) | 0);
      var i1 = (31 & io);
      if ((i2 < $n(this.sci_Vector2__f_data2).u.length)) {
        var a2 = this.sci_Vector2__f_data2;
        var this$2 = $n(a2);
        var a2c = this$2.clone__O();
        var a1 = a2c.get(i2);
        var this$3 = $n(a1);
        var a1c = this$3.clone__O();
        a1c.set(i1, elem);
        a2c.set(i2, a1c);
        var prefix1$1 = this.sci_Vector__f_prefix1;
        var len1$1 = this.sci_Vector2__f_len1;
        var suffix1$1 = this.sci_BigVector__f_suffix1;
        var length0$1 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector2(prefix1$1, len1$1, a2c, suffix1$1, length0$1);
      } else {
        var a1$1 = this.sci_BigVector__f_suffix1;
        var this$5 = $n(a1$1);
        var a1c$1 = this$5.clone__O();
        a1c$1.set(i1, elem);
        var prefix1$2 = this.sci_Vector__f_prefix1;
        var len1$2 = this.sci_Vector2__f_len1;
        var data2$2 = this.sci_Vector2__f_data2;
        var length0$2 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector2(prefix1$2, len1$2, data2$2, a1c$1, length0$2);
      }
    } else {
      var a1$2 = this.sci_Vector__f_prefix1;
      var this$7 = $n(a1$2);
      var a1c$2 = this$7.clone__O();
      a1c$2.set(index, elem);
      var len1 = this.sci_Vector2__f_len1;
      var data2 = this.sci_Vector2__f_data2;
      var suffix1 = this.sci_BigVector__f_suffix1;
      var length0 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector2(a1c$2, len1, data2, suffix1, length0);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector2.prototype.appended__O__sci_Vector = (function(elem) {
  if (($n(this.sci_BigVector__f_suffix1).u.length < 32)) {
    var suffix1$3 = $m_sci_VectorStatics$().copyAppend1__AO__O__AO(this.sci_BigVector__f_suffix1, elem);
    var length0$3 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$3 = this.sci_Vector__f_prefix1;
    var len1$3 = this.sci_Vector2__f_len1;
    var data2$3 = this.sci_Vector2__f_data2;
    return new $c_sci_Vector2(prefix1$3, len1$3, data2$3, suffix1$3, length0$3);
  } else if (($n(this.sci_Vector2__f_data2).u.length < 30)) {
    var data2$4 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector2__f_data2, this.sci_BigVector__f_suffix1), 2);
    var a = new $ac_O(1);
    a.set(0, elem);
    var length0$4 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$4 = this.sci_Vector__f_prefix1;
    var len1$4 = this.sci_Vector2__f_len1;
    return new $c_sci_Vector2(prefix1$4, len1$4, data2$4, a, length0$4);
  } else {
    var $x_5 = this.sci_Vector__f_prefix1;
    var $x_4 = this.sci_Vector2__f_len1;
    var $x_3 = this.sci_Vector2__f_data2;
    var $x_2 = this.sci_Vector2__f_len1;
    var $x_1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var x = this.sci_BigVector__f_suffix1;
    var a$1 = new ($d_O.getArrayOf().getArrayOf().constr)(1);
    a$1.set(0, x);
    var a$2 = new $ac_O(1);
    a$2.set(0, elem);
    return new $c_sci_Vector3($x_5, $x_4, $x_3, ((960 + $x_2) | 0), $x_1, a$1, a$2, ((1 + this.sci_BigVector__f_length0) | 0));
  }
});
$c_sci_Vector2.prototype.vectorSliceCount__I = (function() {
  return 3;
});
$c_sci_Vector2.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.sci_Vector__f_prefix1;
      break;
    }
    case 1: {
      return this.sci_Vector2__f_data2;
      break;
    }
    case 2: {
      return this.sci_BigVector__f_suffix1;
      break;
    }
    default: {
      throw new $c_s_MatchError(idx);
    }
  }
});
$c_sci_Vector2.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector2__f_len1) | 0);
    if ((io >= 0)) {
      var i2 = ((io >>> 5) | 0);
      var i1 = (31 & io);
      return ((i2 < $n(this.sci_Vector2__f_data2).u.length) ? $n($n(this.sci_Vector2__f_data2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get((31 & io)));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
function $as_sci_Vector2(obj) {
  return (((obj instanceof $c_sci_Vector2) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector2"));
}
function $isArrayOf_sci_Vector2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector2)));
}
function $asArrayOf_sci_Vector2(obj, depth) {
  return (($isArrayOf_sci_Vector2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector2;", depth));
}
var $d_sci_Vector2 = new $TypeData().initClass($c_sci_Vector2, "scala.collection.immutable.Vector2", ({
  sci_Vector2: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
/** @constructor */
function $c_sci_Vector3(_prefix1, len1, prefix2, len12, data3, suffix2, _suffix1, _length0) {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
  this.sci_Vector3__f_len1 = 0;
  this.sci_Vector3__f_prefix2 = null;
  this.sci_Vector3__f_len12 = 0;
  this.sci_Vector3__f_data3 = null;
  this.sci_Vector3__f_suffix2 = null;
  this.sci_Vector3__f_len1 = len1;
  this.sci_Vector3__f_prefix2 = prefix2;
  this.sci_Vector3__f_len12 = len12;
  this.sci_Vector3__f_data3 = data3;
  this.sci_Vector3__f_suffix2 = suffix2;
  $ct_sci_BigVector__AO__AO__I__(this, _prefix1, _suffix1, _length0);
}
$c_sci_Vector3.prototype = new $h_sci_BigVector();
$c_sci_Vector3.prototype.constructor = $c_sci_Vector3;
/** @constructor */
function $h_sci_Vector3() {
}
$h_sci_Vector3.prototype = $c_sci_Vector3.prototype;
$c_sci_Vector3.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector3__f_len12) | 0);
    if ((io >= 0)) {
      var i3 = ((io >>> 10) | 0);
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i3 < $n(this.sci_Vector3__f_data3).u.length) ? $n($n($n(this.sci_Vector3__f_data3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector3__f_suffix2).u.length) ? $n($n(this.sci_Vector3__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1)));
    } else if ((index >= this.sci_Vector3__f_len1)) {
      var io$2 = ((index - this.sci_Vector3__f_len1) | 0);
      return $n($n(this.sci_Vector3__f_prefix2).get(((io$2 >>> 5) | 0))).get((31 & io$2));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector3.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    if ((index >= this.sci_Vector3__f_len12)) {
      var io = ((index - this.sci_Vector3__f_len12) | 0);
      var i3 = ((io >>> 10) | 0);
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      if ((i3 < $n(this.sci_Vector3__f_data3).u.length)) {
        var a3 = this.sci_Vector3__f_data3;
        var this$2 = $n(a3);
        var a3c = this$2.clone__O();
        var a2 = a3c.get(i3);
        var this$3 = $n(a2);
        var a2c = this$3.clone__O();
        var a1 = a2c.get(i2);
        var this$4 = $n(a1);
        var a1c = this$4.clone__O();
        a1c.set(i1, elem);
        a2c.set(i2, a1c);
        a3c.set(i3, a2c);
        var prefix1$11 = this.sci_Vector__f_prefix1;
        var len1$11 = this.sci_Vector3__f_len1;
        var prefix2$1 = this.sci_Vector3__f_prefix2;
        var len12$1 = this.sci_Vector3__f_len12;
        var suffix2$1 = this.sci_Vector3__f_suffix2;
        var suffix1$12 = this.sci_BigVector__f_suffix1;
        var length0$12 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector3(prefix1$11, len1$11, prefix2$1, len12$1, a3c, suffix2$1, suffix1$12, length0$12);
      } else if ((i2 < $n(this.sci_Vector3__f_suffix2).u.length)) {
        var a2$1 = this.sci_Vector3__f_suffix2;
        var this$6 = $n(a2$1);
        var a2c$1 = this$6.clone__O();
        var a1$1 = a2c$1.get(i2);
        var this$7 = $n(a1$1);
        var a1c$1 = this$7.clone__O();
        a1c$1.set(i1, elem);
        a2c$1.set(i2, a1c$1);
        var prefix1$12 = this.sci_Vector__f_prefix1;
        var len1$12 = this.sci_Vector3__f_len1;
        var prefix2$2 = this.sci_Vector3__f_prefix2;
        var len12$2 = this.sci_Vector3__f_len12;
        var data3$2 = this.sci_Vector3__f_data3;
        var suffix1$13 = this.sci_BigVector__f_suffix1;
        var length0$13 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector3(prefix1$12, len1$12, prefix2$2, len12$2, data3$2, a2c$1, suffix1$13, length0$13);
      } else {
        var a1$2 = this.sci_BigVector__f_suffix1;
        var this$9 = $n(a1$2);
        var a1c$2 = this$9.clone__O();
        a1c$2.set(i1, elem);
        var prefix1$13 = this.sci_Vector__f_prefix1;
        var len1$13 = this.sci_Vector3__f_len1;
        var prefix2$3 = this.sci_Vector3__f_prefix2;
        var len12$3 = this.sci_Vector3__f_len12;
        var data3$3 = this.sci_Vector3__f_data3;
        var suffix2$3 = this.sci_Vector3__f_suffix2;
        var length0$14 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector3(prefix1$13, len1$13, prefix2$3, len12$3, data3$3, suffix2$3, a1c$2, length0$14);
      }
    } else if ((index >= this.sci_Vector3__f_len1)) {
      var io$2 = ((index - this.sci_Vector3__f_len1) | 0);
      var a2$2 = this.sci_Vector3__f_prefix2;
      var idx2 = ((io$2 >>> 5) | 0);
      var idx1 = (31 & io$2);
      var this$11 = $n(a2$2);
      var a2c$2 = this$11.clone__O();
      var a1$3 = a2c$2.get(idx2);
      var this$12 = $n(a1$3);
      var a1c$3 = this$12.clone__O();
      a1c$3.set(idx1, elem);
      a2c$2.set(idx2, a1c$3);
      var prefix1$14 = this.sci_Vector__f_prefix1;
      var len1$14 = this.sci_Vector3__f_len1;
      var len12$4 = this.sci_Vector3__f_len12;
      var data3$4 = this.sci_Vector3__f_data3;
      var suffix2$4 = this.sci_Vector3__f_suffix2;
      var suffix1$15 = this.sci_BigVector__f_suffix1;
      var length0$15 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector3(prefix1$14, len1$14, a2c$2, len12$4, data3$4, suffix2$4, suffix1$15, length0$15);
    } else {
      var a1$4 = this.sci_Vector__f_prefix1;
      var this$14 = $n(a1$4);
      var a1c$4 = this$14.clone__O();
      a1c$4.set(index, elem);
      var len1 = this.sci_Vector3__f_len1;
      var prefix2 = this.sci_Vector3__f_prefix2;
      var len12 = this.sci_Vector3__f_len12;
      var data3 = this.sci_Vector3__f_data3;
      var suffix2 = this.sci_Vector3__f_suffix2;
      var suffix1 = this.sci_BigVector__f_suffix1;
      var length0 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector3(a1c$4, len1, prefix2, len12, data3, suffix2, suffix1, length0);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector3.prototype.appended__O__sci_Vector = (function(elem) {
  if (($n(this.sci_BigVector__f_suffix1).u.length < 32)) {
    var suffix1$16 = $m_sci_VectorStatics$().copyAppend1__AO__O__AO(this.sci_BigVector__f_suffix1, elem);
    var length0$16 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$15 = this.sci_Vector__f_prefix1;
    var len1$15 = this.sci_Vector3__f_len1;
    var prefix2$5 = this.sci_Vector3__f_prefix2;
    var len12$5 = this.sci_Vector3__f_len12;
    var data3$5 = this.sci_Vector3__f_data3;
    var suffix2$5 = this.sci_Vector3__f_suffix2;
    return new $c_sci_Vector3(prefix1$15, len1$15, prefix2$5, len12$5, data3$5, suffix2$5, suffix1$16, length0$16);
  } else if (($n(this.sci_Vector3__f_suffix2).u.length < 31)) {
    var suffix2$6 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector3__f_suffix2, this.sci_BigVector__f_suffix1), 2);
    var a = new $ac_O(1);
    a.set(0, elem);
    var length0$17 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$16 = this.sci_Vector__f_prefix1;
    var len1$16 = this.sci_Vector3__f_len1;
    var prefix2$6 = this.sci_Vector3__f_prefix2;
    var len12$6 = this.sci_Vector3__f_len12;
    var data3$6 = this.sci_Vector3__f_data3;
    return new $c_sci_Vector3(prefix1$16, len1$16, prefix2$6, len12$6, data3$6, suffix2$6, a, length0$17);
  } else if (($n(this.sci_Vector3__f_data3).u.length < 30)) {
    var data3$7 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector3__f_data3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector3__f_suffix2, this.sci_BigVector__f_suffix1)), 3);
    var a$1 = new $ac_O(1);
    a$1.set(0, elem);
    var length0$18 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$17 = this.sci_Vector__f_prefix1;
    var len1$17 = this.sci_Vector3__f_len1;
    var prefix2$7 = this.sci_Vector3__f_prefix2;
    var len12$7 = this.sci_Vector3__f_len12;
    var suffix2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector3(prefix1$17, len1$17, prefix2$7, len12$7, data3$7, suffix2, a$1, length0$18);
  } else {
    var $x_8 = this.sci_Vector__f_prefix1;
    var $x_7 = this.sci_Vector3__f_len1;
    var $x_6 = this.sci_Vector3__f_prefix2;
    var $x_5 = this.sci_Vector3__f_len12;
    var $x_4 = this.sci_Vector3__f_data3;
    var $x_3 = this.sci_Vector3__f_len12;
    var $x_2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty4;
    var x = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector3__f_suffix2, this.sci_BigVector__f_suffix1), 2);
    var a$2 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().constr)(1);
    a$2.set(0, x);
    var $x_1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    var a$3 = new $ac_O(1);
    a$3.set(0, elem);
    return new $c_sci_Vector4($x_8, $x_7, $x_6, $x_5, $x_4, ((30720 + $x_3) | 0), $x_2, a$2, $x_1, a$3, ((1 + this.sci_BigVector__f_length0) | 0));
  }
});
$c_sci_Vector3.prototype.vectorSliceCount__I = (function() {
  return 5;
});
$c_sci_Vector3.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.sci_Vector__f_prefix1;
      break;
    }
    case 1: {
      return this.sci_Vector3__f_prefix2;
      break;
    }
    case 2: {
      return this.sci_Vector3__f_data3;
      break;
    }
    case 3: {
      return this.sci_Vector3__f_suffix2;
      break;
    }
    case 4: {
      return this.sci_BigVector__f_suffix1;
      break;
    }
    default: {
      throw new $c_s_MatchError(idx);
    }
  }
});
$c_sci_Vector3.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector3__f_len12) | 0);
    if ((io >= 0)) {
      var i3 = ((io >>> 10) | 0);
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i3 < $n(this.sci_Vector3__f_data3).u.length) ? $n($n($n(this.sci_Vector3__f_data3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector3__f_suffix2).u.length) ? $n($n(this.sci_Vector3__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1)));
    } else if ((index >= this.sci_Vector3__f_len1)) {
      var io$2 = ((index - this.sci_Vector3__f_len1) | 0);
      return $n($n(this.sci_Vector3__f_prefix2).get(((io$2 >>> 5) | 0))).get((31 & io$2));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
function $as_sci_Vector3(obj) {
  return (((obj instanceof $c_sci_Vector3) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector3"));
}
function $isArrayOf_sci_Vector3(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector3)));
}
function $asArrayOf_sci_Vector3(obj, depth) {
  return (($isArrayOf_sci_Vector3(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector3;", depth));
}
var $d_sci_Vector3 = new $TypeData().initClass($c_sci_Vector3, "scala.collection.immutable.Vector3", ({
  sci_Vector3: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
/** @constructor */
function $c_sci_Vector4(_prefix1, len1, prefix2, len12, prefix3, len123, data4, suffix3, suffix2, _suffix1, _length0) {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
  this.sci_Vector4__f_len1 = 0;
  this.sci_Vector4__f_prefix2 = null;
  this.sci_Vector4__f_len12 = 0;
  this.sci_Vector4__f_prefix3 = null;
  this.sci_Vector4__f_len123 = 0;
  this.sci_Vector4__f_data4 = null;
  this.sci_Vector4__f_suffix3 = null;
  this.sci_Vector4__f_suffix2 = null;
  this.sci_Vector4__f_len1 = len1;
  this.sci_Vector4__f_prefix2 = prefix2;
  this.sci_Vector4__f_len12 = len12;
  this.sci_Vector4__f_prefix3 = prefix3;
  this.sci_Vector4__f_len123 = len123;
  this.sci_Vector4__f_data4 = data4;
  this.sci_Vector4__f_suffix3 = suffix3;
  this.sci_Vector4__f_suffix2 = suffix2;
  $ct_sci_BigVector__AO__AO__I__(this, _prefix1, _suffix1, _length0);
}
$c_sci_Vector4.prototype = new $h_sci_BigVector();
$c_sci_Vector4.prototype.constructor = $c_sci_Vector4;
/** @constructor */
function $h_sci_Vector4() {
}
$h_sci_Vector4.prototype = $c_sci_Vector4.prototype;
$c_sci_Vector4.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector4__f_len123) | 0);
    if ((io >= 0)) {
      var i4 = ((io >>> 15) | 0);
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i4 < $n(this.sci_Vector4__f_data4).u.length) ? $n($n($n($n(this.sci_Vector4__f_data4).get(i4)).get(i3)).get(i2)).get(i1) : ((i3 < $n(this.sci_Vector4__f_suffix3).u.length) ? $n($n($n(this.sci_Vector4__f_suffix3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector4__f_suffix2).u.length) ? $n($n(this.sci_Vector4__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1))));
    } else if ((index >= this.sci_Vector4__f_len12)) {
      var io$2 = ((index - this.sci_Vector4__f_len12) | 0);
      return $n($n($n(this.sci_Vector4__f_prefix3).get(((io$2 >>> 10) | 0))).get((31 & ((io$2 >>> 5) | 0)))).get((31 & io$2));
    } else if ((index >= this.sci_Vector4__f_len1)) {
      var io$3 = ((index - this.sci_Vector4__f_len1) | 0);
      return $n($n(this.sci_Vector4__f_prefix2).get(((io$3 >>> 5) | 0))).get((31 & io$3));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector4.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    if ((index >= this.sci_Vector4__f_len123)) {
      var io = ((index - this.sci_Vector4__f_len123) | 0);
      var i4 = ((io >>> 15) | 0);
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      if ((i4 < $n(this.sci_Vector4__f_data4).u.length)) {
        var a4 = this.sci_Vector4__f_data4;
        var this$2 = $n(a4);
        var a4c = this$2.clone__O();
        var a3 = a4c.get(i4);
        var this$3 = $n(a3);
        var a3c = this$3.clone__O();
        var a2 = a3c.get(i3);
        var this$4 = $n(a2);
        var a2c = this$4.clone__O();
        var a1 = a2c.get(i2);
        var this$5 = $n(a1);
        var a1c = this$5.clone__O();
        a1c.set(i1, elem);
        a2c.set(i2, a1c);
        a3c.set(i3, a2c);
        a4c.set(i4, a3c);
        var prefix1$25 = this.sci_Vector__f_prefix1;
        var len1$24 = this.sci_Vector4__f_len1;
        var prefix2$15 = this.sci_Vector4__f_prefix2;
        var len12$15 = this.sci_Vector4__f_len12;
        var prefix3$1 = this.sci_Vector4__f_prefix3;
        var len123$1 = this.sci_Vector4__f_len123;
        var suffix3$1 = this.sci_Vector4__f_suffix3;
        var suffix2$15 = this.sci_Vector4__f_suffix2;
        var suffix1$27 = this.sci_BigVector__f_suffix1;
        var length0$27 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector4(prefix1$25, len1$24, prefix2$15, len12$15, prefix3$1, len123$1, a4c, suffix3$1, suffix2$15, suffix1$27, length0$27);
      } else if ((i3 < $n(this.sci_Vector4__f_suffix3).u.length)) {
        var a3$1 = this.sci_Vector4__f_suffix3;
        var this$7 = $n(a3$1);
        var a3c$1 = this$7.clone__O();
        var a2$1 = a3c$1.get(i3);
        var this$8 = $n(a2$1);
        var a2c$1 = this$8.clone__O();
        var a1$1 = a2c$1.get(i2);
        var this$9 = $n(a1$1);
        var a1c$1 = this$9.clone__O();
        a1c$1.set(i1, elem);
        a2c$1.set(i2, a1c$1);
        a3c$1.set(i3, a2c$1);
        var prefix1$26 = this.sci_Vector__f_prefix1;
        var len1$25 = this.sci_Vector4__f_len1;
        var prefix2$16 = this.sci_Vector4__f_prefix2;
        var len12$16 = this.sci_Vector4__f_len12;
        var prefix3$2 = this.sci_Vector4__f_prefix3;
        var len123$2 = this.sci_Vector4__f_len123;
        var data4$2 = this.sci_Vector4__f_data4;
        var suffix2$16 = this.sci_Vector4__f_suffix2;
        var suffix1$28 = this.sci_BigVector__f_suffix1;
        var length0$28 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector4(prefix1$26, len1$25, prefix2$16, len12$16, prefix3$2, len123$2, data4$2, a3c$1, suffix2$16, suffix1$28, length0$28);
      } else if ((i2 < $n(this.sci_Vector4__f_suffix2).u.length)) {
        var a2$2 = this.sci_Vector4__f_suffix2;
        var this$11 = $n(a2$2);
        var a2c$2 = this$11.clone__O();
        var a1$2 = a2c$2.get(i2);
        var this$12 = $n(a1$2);
        var a1c$2 = this$12.clone__O();
        a1c$2.set(i1, elem);
        a2c$2.set(i2, a1c$2);
        var prefix1$27 = this.sci_Vector__f_prefix1;
        var len1$26 = this.sci_Vector4__f_len1;
        var prefix2$17 = this.sci_Vector4__f_prefix2;
        var len12$17 = this.sci_Vector4__f_len12;
        var prefix3$3 = this.sci_Vector4__f_prefix3;
        var len123$3 = this.sci_Vector4__f_len123;
        var data4$3 = this.sci_Vector4__f_data4;
        var suffix3$3 = this.sci_Vector4__f_suffix3;
        var suffix1$29 = this.sci_BigVector__f_suffix1;
        var length0$29 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector4(prefix1$27, len1$26, prefix2$17, len12$17, prefix3$3, len123$3, data4$3, suffix3$3, a2c$2, suffix1$29, length0$29);
      } else {
        var a1$3 = this.sci_BigVector__f_suffix1;
        var this$14 = $n(a1$3);
        var a1c$3 = this$14.clone__O();
        a1c$3.set(i1, elem);
        var prefix1$28 = this.sci_Vector__f_prefix1;
        var len1$27 = this.sci_Vector4__f_len1;
        var prefix2$18 = this.sci_Vector4__f_prefix2;
        var len12$18 = this.sci_Vector4__f_len12;
        var prefix3$4 = this.sci_Vector4__f_prefix3;
        var len123$4 = this.sci_Vector4__f_len123;
        var data4$4 = this.sci_Vector4__f_data4;
        var suffix3$4 = this.sci_Vector4__f_suffix3;
        var suffix2$18 = this.sci_Vector4__f_suffix2;
        var length0$30 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector4(prefix1$28, len1$27, prefix2$18, len12$18, prefix3$4, len123$4, data4$4, suffix3$4, suffix2$18, a1c$3, length0$30);
      }
    } else if ((index >= this.sci_Vector4__f_len12)) {
      var io$2 = ((index - this.sci_Vector4__f_len12) | 0);
      var a3$2 = this.sci_Vector4__f_prefix3;
      var idx3 = ((io$2 >>> 10) | 0);
      var idx2 = (31 & ((io$2 >>> 5) | 0));
      var idx1 = (31 & io$2);
      var this$16 = $n(a3$2);
      var a3c$2 = this$16.clone__O();
      var a2$3 = a3c$2.get(idx3);
      var this$17 = $n(a2$3);
      var a2c$3 = this$17.clone__O();
      var a1$4 = a2c$3.get(idx2);
      var this$18 = $n(a1$4);
      var a1c$4 = this$18.clone__O();
      a1c$4.set(idx1, elem);
      a2c$3.set(idx2, a1c$4);
      a3c$2.set(idx3, a2c$3);
      var prefix1$29 = this.sci_Vector__f_prefix1;
      var len1$28 = this.sci_Vector4__f_len1;
      var prefix2$19 = this.sci_Vector4__f_prefix2;
      var len12$19 = this.sci_Vector4__f_len12;
      var len123$5 = this.sci_Vector4__f_len123;
      var data4$5 = this.sci_Vector4__f_data4;
      var suffix3$5 = this.sci_Vector4__f_suffix3;
      var suffix2$19 = this.sci_Vector4__f_suffix2;
      var suffix1$31 = this.sci_BigVector__f_suffix1;
      var length0$31 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector4(prefix1$29, len1$28, prefix2$19, len12$19, a3c$2, len123$5, data4$5, suffix3$5, suffix2$19, suffix1$31, length0$31);
    } else if ((index >= this.sci_Vector4__f_len1)) {
      var io$3 = ((index - this.sci_Vector4__f_len1) | 0);
      var a2$4 = this.sci_Vector4__f_prefix2;
      var idx2$1 = ((io$3 >>> 5) | 0);
      var idx1$1 = (31 & io$3);
      var this$20 = $n(a2$4);
      var a2c$4 = this$20.clone__O();
      var a1$5 = a2c$4.get(idx2$1);
      var this$21 = $n(a1$5);
      var a1c$5 = this$21.clone__O();
      a1c$5.set(idx1$1, elem);
      a2c$4.set(idx2$1, a1c$5);
      var prefix1$30 = this.sci_Vector__f_prefix1;
      var len1$29 = this.sci_Vector4__f_len1;
      var len12$20 = this.sci_Vector4__f_len12;
      var prefix3$6 = this.sci_Vector4__f_prefix3;
      var len123$6 = this.sci_Vector4__f_len123;
      var data4$6 = this.sci_Vector4__f_data4;
      var suffix3$6 = this.sci_Vector4__f_suffix3;
      var suffix2$20 = this.sci_Vector4__f_suffix2;
      var suffix1$32 = this.sci_BigVector__f_suffix1;
      var length0$32 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector4(prefix1$30, len1$29, a2c$4, len12$20, prefix3$6, len123$6, data4$6, suffix3$6, suffix2$20, suffix1$32, length0$32);
    } else {
      var a1$6 = this.sci_Vector__f_prefix1;
      var this$23 = $n(a1$6);
      var a1c$6 = this$23.clone__O();
      a1c$6.set(index, elem);
      var len1 = this.sci_Vector4__f_len1;
      var prefix2 = this.sci_Vector4__f_prefix2;
      var len12 = this.sci_Vector4__f_len12;
      var prefix3 = this.sci_Vector4__f_prefix3;
      var len123 = this.sci_Vector4__f_len123;
      var data4 = this.sci_Vector4__f_data4;
      var suffix3 = this.sci_Vector4__f_suffix3;
      var suffix2 = this.sci_Vector4__f_suffix2;
      var suffix1 = this.sci_BigVector__f_suffix1;
      var length0 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector4(a1c$6, len1, prefix2, len12, prefix3, len123, data4, suffix3, suffix2, suffix1, length0);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector4.prototype.appended__O__sci_Vector = (function(elem) {
  if (($n(this.sci_BigVector__f_suffix1).u.length < 32)) {
    var suffix1$33 = $m_sci_VectorStatics$().copyAppend1__AO__O__AO(this.sci_BigVector__f_suffix1, elem);
    var length0$33 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$31 = this.sci_Vector__f_prefix1;
    var len1$30 = this.sci_Vector4__f_len1;
    var prefix2$21 = this.sci_Vector4__f_prefix2;
    var len12$21 = this.sci_Vector4__f_len12;
    var prefix3$7 = this.sci_Vector4__f_prefix3;
    var len123$7 = this.sci_Vector4__f_len123;
    var data4$7 = this.sci_Vector4__f_data4;
    var suffix3$7 = this.sci_Vector4__f_suffix3;
    var suffix2$21 = this.sci_Vector4__f_suffix2;
    return new $c_sci_Vector4(prefix1$31, len1$30, prefix2$21, len12$21, prefix3$7, len123$7, data4$7, suffix3$7, suffix2$21, suffix1$33, length0$33);
  } else if (($n(this.sci_Vector4__f_suffix2).u.length < 31)) {
    var suffix2$22 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix2, this.sci_BigVector__f_suffix1), 2);
    var a = new $ac_O(1);
    a.set(0, elem);
    var length0$34 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$32 = this.sci_Vector__f_prefix1;
    var len1$31 = this.sci_Vector4__f_len1;
    var prefix2$22 = this.sci_Vector4__f_prefix2;
    var len12$22 = this.sci_Vector4__f_len12;
    var prefix3$8 = this.sci_Vector4__f_prefix3;
    var len123$8 = this.sci_Vector4__f_len123;
    var data4$8 = this.sci_Vector4__f_data4;
    var suffix3$8 = this.sci_Vector4__f_suffix3;
    return new $c_sci_Vector4(prefix1$32, len1$31, prefix2$22, len12$22, prefix3$8, len123$8, data4$8, suffix3$8, suffix2$22, a, length0$34);
  } else if (($n(this.sci_Vector4__f_suffix3).u.length < 31)) {
    var suffix3$9 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix2, this.sci_BigVector__f_suffix1)), 3);
    var a$1 = new $ac_O(1);
    a$1.set(0, elem);
    var length0$35 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$33 = this.sci_Vector__f_prefix1;
    var len1$32 = this.sci_Vector4__f_len1;
    var prefix2$23 = this.sci_Vector4__f_prefix2;
    var len12$23 = this.sci_Vector4__f_len12;
    var prefix3$9 = this.sci_Vector4__f_prefix3;
    var len123$9 = this.sci_Vector4__f_len123;
    var data4$9 = this.sci_Vector4__f_data4;
    var suffix2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector4(prefix1$33, len1$32, prefix2$23, len12$23, prefix3$9, len123$9, data4$9, suffix3$9, suffix2, a$1, length0$35);
  } else if (($n(this.sci_Vector4__f_data4).u.length < 30)) {
    var data4$10 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_data4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix2, this.sci_BigVector__f_suffix1))), 4);
    var a$2 = new $ac_O(1);
    a$2.set(0, elem);
    var length0$36 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$34 = this.sci_Vector__f_prefix1;
    var len1$33 = this.sci_Vector4__f_len1;
    var prefix2$24 = this.sci_Vector4__f_prefix2;
    var len12$24 = this.sci_Vector4__f_len12;
    var prefix3$10 = this.sci_Vector4__f_prefix3;
    var len123$10 = this.sci_Vector4__f_len123;
    var suffix3 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var suffix2$1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector4(prefix1$34, len1$33, prefix2$24, len12$24, prefix3$10, len123$10, data4$10, suffix3, suffix2$1, a$2, length0$36);
  } else {
    var $x_11 = this.sci_Vector__f_prefix1;
    var $x_10 = this.sci_Vector4__f_len1;
    var $x_9 = this.sci_Vector4__f_prefix2;
    var $x_8 = this.sci_Vector4__f_len12;
    var $x_7 = this.sci_Vector4__f_prefix3;
    var $x_6 = this.sci_Vector4__f_len123;
    var $x_5 = this.sci_Vector4__f_data4;
    var $x_4 = this.sci_Vector4__f_len123;
    var $x_3 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty5;
    var x = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector4__f_suffix2, this.sci_BigVector__f_suffix1)), 3);
    var a$3 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(1);
    a$3.set(0, x);
    var $x_2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var $x_1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    var a$4 = new $ac_O(1);
    a$4.set(0, elem);
    return new $c_sci_Vector5($x_11, $x_10, $x_9, $x_8, $x_7, $x_6, $x_5, ((983040 + $x_4) | 0), $x_3, a$3, $x_2, $x_1, a$4, ((1 + this.sci_BigVector__f_length0) | 0));
  }
});
$c_sci_Vector4.prototype.vectorSliceCount__I = (function() {
  return 7;
});
$c_sci_Vector4.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.sci_Vector__f_prefix1;
      break;
    }
    case 1: {
      return this.sci_Vector4__f_prefix2;
      break;
    }
    case 2: {
      return this.sci_Vector4__f_prefix3;
      break;
    }
    case 3: {
      return this.sci_Vector4__f_data4;
      break;
    }
    case 4: {
      return this.sci_Vector4__f_suffix3;
      break;
    }
    case 5: {
      return this.sci_Vector4__f_suffix2;
      break;
    }
    case 6: {
      return this.sci_BigVector__f_suffix1;
      break;
    }
    default: {
      throw new $c_s_MatchError(idx);
    }
  }
});
$c_sci_Vector4.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector4__f_len123) | 0);
    if ((io >= 0)) {
      var i4 = ((io >>> 15) | 0);
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i4 < $n(this.sci_Vector4__f_data4).u.length) ? $n($n($n($n(this.sci_Vector4__f_data4).get(i4)).get(i3)).get(i2)).get(i1) : ((i3 < $n(this.sci_Vector4__f_suffix3).u.length) ? $n($n($n(this.sci_Vector4__f_suffix3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector4__f_suffix2).u.length) ? $n($n(this.sci_Vector4__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1))));
    } else if ((index >= this.sci_Vector4__f_len12)) {
      var io$2 = ((index - this.sci_Vector4__f_len12) | 0);
      return $n($n($n(this.sci_Vector4__f_prefix3).get(((io$2 >>> 10) | 0))).get((31 & ((io$2 >>> 5) | 0)))).get((31 & io$2));
    } else if ((index >= this.sci_Vector4__f_len1)) {
      var io$3 = ((index - this.sci_Vector4__f_len1) | 0);
      return $n($n(this.sci_Vector4__f_prefix2).get(((io$3 >>> 5) | 0))).get((31 & io$3));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
function $as_sci_Vector4(obj) {
  return (((obj instanceof $c_sci_Vector4) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector4"));
}
function $isArrayOf_sci_Vector4(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector4)));
}
function $asArrayOf_sci_Vector4(obj, depth) {
  return (($isArrayOf_sci_Vector4(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector4;", depth));
}
var $d_sci_Vector4 = new $TypeData().initClass($c_sci_Vector4, "scala.collection.immutable.Vector4", ({
  sci_Vector4: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
/** @constructor */
function $c_sci_Vector5(_prefix1, len1, prefix2, len12, prefix3, len123, prefix4, len1234, data5, suffix4, suffix3, suffix2, _suffix1, _length0) {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
  this.sci_Vector5__f_len1 = 0;
  this.sci_Vector5__f_prefix2 = null;
  this.sci_Vector5__f_len12 = 0;
  this.sci_Vector5__f_prefix3 = null;
  this.sci_Vector5__f_len123 = 0;
  this.sci_Vector5__f_prefix4 = null;
  this.sci_Vector5__f_len1234 = 0;
  this.sci_Vector5__f_data5 = null;
  this.sci_Vector5__f_suffix4 = null;
  this.sci_Vector5__f_suffix3 = null;
  this.sci_Vector5__f_suffix2 = null;
  this.sci_Vector5__f_len1 = len1;
  this.sci_Vector5__f_prefix2 = prefix2;
  this.sci_Vector5__f_len12 = len12;
  this.sci_Vector5__f_prefix3 = prefix3;
  this.sci_Vector5__f_len123 = len123;
  this.sci_Vector5__f_prefix4 = prefix4;
  this.sci_Vector5__f_len1234 = len1234;
  this.sci_Vector5__f_data5 = data5;
  this.sci_Vector5__f_suffix4 = suffix4;
  this.sci_Vector5__f_suffix3 = suffix3;
  this.sci_Vector5__f_suffix2 = suffix2;
  $ct_sci_BigVector__AO__AO__I__(this, _prefix1, _suffix1, _length0);
}
$c_sci_Vector5.prototype = new $h_sci_BigVector();
$c_sci_Vector5.prototype.constructor = $c_sci_Vector5;
/** @constructor */
function $h_sci_Vector5() {
}
$h_sci_Vector5.prototype = $c_sci_Vector5.prototype;
$c_sci_Vector5.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector5__f_len1234) | 0);
    if ((io >= 0)) {
      var i5 = ((io >>> 20) | 0);
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i5 < $n(this.sci_Vector5__f_data5).u.length) ? $n($n($n($n($n(this.sci_Vector5__f_data5).get(i5)).get(i4)).get(i3)).get(i2)).get(i1) : ((i4 < $n(this.sci_Vector5__f_suffix4).u.length) ? $n($n($n($n(this.sci_Vector5__f_suffix4).get(i4)).get(i3)).get(i2)).get(i1) : ((i3 < $n(this.sci_Vector5__f_suffix3).u.length) ? $n($n($n(this.sci_Vector5__f_suffix3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector5__f_suffix2).u.length) ? $n($n(this.sci_Vector5__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1)))));
    } else if ((index >= this.sci_Vector5__f_len123)) {
      var io$2 = ((index - this.sci_Vector5__f_len123) | 0);
      return $n($n($n($n(this.sci_Vector5__f_prefix4).get(((io$2 >>> 15) | 0))).get((31 & ((io$2 >>> 10) | 0)))).get((31 & ((io$2 >>> 5) | 0)))).get((31 & io$2));
    } else if ((index >= this.sci_Vector5__f_len12)) {
      var io$3 = ((index - this.sci_Vector5__f_len12) | 0);
      return $n($n($n(this.sci_Vector5__f_prefix3).get(((io$3 >>> 10) | 0))).get((31 & ((io$3 >>> 5) | 0)))).get((31 & io$3));
    } else if ((index >= this.sci_Vector5__f_len1)) {
      var io$4 = ((index - this.sci_Vector5__f_len1) | 0);
      return $n($n(this.sci_Vector5__f_prefix2).get(((io$4 >>> 5) | 0))).get((31 & io$4));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector5.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    if ((index >= this.sci_Vector5__f_len1234)) {
      var io = ((index - this.sci_Vector5__f_len1234) | 0);
      var i5 = ((io >>> 20) | 0);
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      if ((i5 < $n(this.sci_Vector5__f_data5).u.length)) {
        var a5 = this.sci_Vector5__f_data5;
        var this$2 = $n(a5);
        var a5c = this$2.clone__O();
        var a4 = a5c.get(i5);
        var this$3 = $n(a4);
        var a4c = this$3.clone__O();
        var a3 = a4c.get(i4);
        var this$4 = $n(a3);
        var a3c = this$4.clone__O();
        var a2 = a3c.get(i3);
        var this$5 = $n(a2);
        var a2c = this$5.clone__O();
        var a1 = a2c.get(i2);
        var this$6 = $n(a1);
        var a1c = this$6.clone__O();
        a1c.set(i1, elem);
        a2c.set(i2, a1c);
        a3c.set(i3, a2c);
        a4c.set(i4, a3c);
        a5c.set(i5, a4c);
        var prefix1$43 = this.sci_Vector__f_prefix1;
        var len1$40 = this.sci_Vector5__f_len1;
        var prefix2$32 = this.sci_Vector5__f_prefix2;
        var len12$32 = this.sci_Vector5__f_len12;
        var prefix3$19 = this.sci_Vector5__f_prefix3;
        var len123$19 = this.sci_Vector5__f_len123;
        var prefix4$1 = this.sci_Vector5__f_prefix4;
        var len1234$1 = this.sci_Vector5__f_len1234;
        var suffix4$1 = this.sci_Vector5__f_suffix4;
        var suffix3$19 = this.sci_Vector5__f_suffix3;
        var suffix2$32 = this.sci_Vector5__f_suffix2;
        var suffix1$46 = this.sci_BigVector__f_suffix1;
        var length0$46 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector5(prefix1$43, len1$40, prefix2$32, len12$32, prefix3$19, len123$19, prefix4$1, len1234$1, a5c, suffix4$1, suffix3$19, suffix2$32, suffix1$46, length0$46);
      } else if ((i4 < $n(this.sci_Vector5__f_suffix4).u.length)) {
        var a4$1 = this.sci_Vector5__f_suffix4;
        var this$8 = $n(a4$1);
        var a4c$1 = this$8.clone__O();
        var a3$1 = a4c$1.get(i4);
        var this$9 = $n(a3$1);
        var a3c$1 = this$9.clone__O();
        var a2$1 = a3c$1.get(i3);
        var this$10 = $n(a2$1);
        var a2c$1 = this$10.clone__O();
        var a1$1 = a2c$1.get(i2);
        var this$11 = $n(a1$1);
        var a1c$1 = this$11.clone__O();
        a1c$1.set(i1, elem);
        a2c$1.set(i2, a1c$1);
        a3c$1.set(i3, a2c$1);
        a4c$1.set(i4, a3c$1);
        var prefix1$44 = this.sci_Vector__f_prefix1;
        var len1$41 = this.sci_Vector5__f_len1;
        var prefix2$33 = this.sci_Vector5__f_prefix2;
        var len12$33 = this.sci_Vector5__f_len12;
        var prefix3$20 = this.sci_Vector5__f_prefix3;
        var len123$20 = this.sci_Vector5__f_len123;
        var prefix4$2 = this.sci_Vector5__f_prefix4;
        var len1234$2 = this.sci_Vector5__f_len1234;
        var data5$2 = this.sci_Vector5__f_data5;
        var suffix3$20 = this.sci_Vector5__f_suffix3;
        var suffix2$33 = this.sci_Vector5__f_suffix2;
        var suffix1$47 = this.sci_BigVector__f_suffix1;
        var length0$47 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector5(prefix1$44, len1$41, prefix2$33, len12$33, prefix3$20, len123$20, prefix4$2, len1234$2, data5$2, a4c$1, suffix3$20, suffix2$33, suffix1$47, length0$47);
      } else if ((i3 < $n(this.sci_Vector5__f_suffix3).u.length)) {
        var a3$2 = this.sci_Vector5__f_suffix3;
        var this$13 = $n(a3$2);
        var a3c$2 = this$13.clone__O();
        var a2$2 = a3c$2.get(i3);
        var this$14 = $n(a2$2);
        var a2c$2 = this$14.clone__O();
        var a1$2 = a2c$2.get(i2);
        var this$15 = $n(a1$2);
        var a1c$2 = this$15.clone__O();
        a1c$2.set(i1, elem);
        a2c$2.set(i2, a1c$2);
        a3c$2.set(i3, a2c$2);
        var prefix1$45 = this.sci_Vector__f_prefix1;
        var len1$42 = this.sci_Vector5__f_len1;
        var prefix2$34 = this.sci_Vector5__f_prefix2;
        var len12$34 = this.sci_Vector5__f_len12;
        var prefix3$21 = this.sci_Vector5__f_prefix3;
        var len123$21 = this.sci_Vector5__f_len123;
        var prefix4$3 = this.sci_Vector5__f_prefix4;
        var len1234$3 = this.sci_Vector5__f_len1234;
        var data5$3 = this.sci_Vector5__f_data5;
        var suffix4$3 = this.sci_Vector5__f_suffix4;
        var suffix2$34 = this.sci_Vector5__f_suffix2;
        var suffix1$48 = this.sci_BigVector__f_suffix1;
        var length0$48 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector5(prefix1$45, len1$42, prefix2$34, len12$34, prefix3$21, len123$21, prefix4$3, len1234$3, data5$3, suffix4$3, a3c$2, suffix2$34, suffix1$48, length0$48);
      } else if ((i2 < $n(this.sci_Vector5__f_suffix2).u.length)) {
        var a2$3 = this.sci_Vector5__f_suffix2;
        var this$17 = $n(a2$3);
        var a2c$3 = this$17.clone__O();
        var a1$3 = a2c$3.get(i2);
        var this$18 = $n(a1$3);
        var a1c$3 = this$18.clone__O();
        a1c$3.set(i1, elem);
        a2c$3.set(i2, a1c$3);
        var prefix1$46 = this.sci_Vector__f_prefix1;
        var len1$43 = this.sci_Vector5__f_len1;
        var prefix2$35 = this.sci_Vector5__f_prefix2;
        var len12$35 = this.sci_Vector5__f_len12;
        var prefix3$22 = this.sci_Vector5__f_prefix3;
        var len123$22 = this.sci_Vector5__f_len123;
        var prefix4$4 = this.sci_Vector5__f_prefix4;
        var len1234$4 = this.sci_Vector5__f_len1234;
        var data5$4 = this.sci_Vector5__f_data5;
        var suffix4$4 = this.sci_Vector5__f_suffix4;
        var suffix3$22 = this.sci_Vector5__f_suffix3;
        var suffix1$49 = this.sci_BigVector__f_suffix1;
        var length0$49 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector5(prefix1$46, len1$43, prefix2$35, len12$35, prefix3$22, len123$22, prefix4$4, len1234$4, data5$4, suffix4$4, suffix3$22, a2c$3, suffix1$49, length0$49);
      } else {
        var a1$4 = this.sci_BigVector__f_suffix1;
        var this$20 = $n(a1$4);
        var a1c$4 = this$20.clone__O();
        a1c$4.set(i1, elem);
        var prefix1$47 = this.sci_Vector__f_prefix1;
        var len1$44 = this.sci_Vector5__f_len1;
        var prefix2$36 = this.sci_Vector5__f_prefix2;
        var len12$36 = this.sci_Vector5__f_len12;
        var prefix3$23 = this.sci_Vector5__f_prefix3;
        var len123$23 = this.sci_Vector5__f_len123;
        var prefix4$5 = this.sci_Vector5__f_prefix4;
        var len1234$5 = this.sci_Vector5__f_len1234;
        var data5$5 = this.sci_Vector5__f_data5;
        var suffix4$5 = this.sci_Vector5__f_suffix4;
        var suffix3$23 = this.sci_Vector5__f_suffix3;
        var suffix2$36 = this.sci_Vector5__f_suffix2;
        var length0$50 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector5(prefix1$47, len1$44, prefix2$36, len12$36, prefix3$23, len123$23, prefix4$5, len1234$5, data5$5, suffix4$5, suffix3$23, suffix2$36, a1c$4, length0$50);
      }
    } else if ((index >= this.sci_Vector5__f_len123)) {
      var io$2 = ((index - this.sci_Vector5__f_len123) | 0);
      var a4$2 = this.sci_Vector5__f_prefix4;
      var idx4 = ((io$2 >>> 15) | 0);
      var idx3 = (31 & ((io$2 >>> 10) | 0));
      var idx2 = (31 & ((io$2 >>> 5) | 0));
      var idx1 = (31 & io$2);
      var this$22 = $n(a4$2);
      var a4c$2 = this$22.clone__O();
      var a3$3 = a4c$2.get(idx4);
      var this$23 = $n(a3$3);
      var a3c$3 = this$23.clone__O();
      var a2$4 = a3c$3.get(idx3);
      var this$24 = $n(a2$4);
      var a2c$4 = this$24.clone__O();
      var a1$5 = a2c$4.get(idx2);
      var this$25 = $n(a1$5);
      var a1c$5 = this$25.clone__O();
      a1c$5.set(idx1, elem);
      a2c$4.set(idx2, a1c$5);
      a3c$3.set(idx3, a2c$4);
      a4c$2.set(idx4, a3c$3);
      var prefix1$48 = this.sci_Vector__f_prefix1;
      var len1$45 = this.sci_Vector5__f_len1;
      var prefix2$37 = this.sci_Vector5__f_prefix2;
      var len12$37 = this.sci_Vector5__f_len12;
      var prefix3$24 = this.sci_Vector5__f_prefix3;
      var len123$24 = this.sci_Vector5__f_len123;
      var len1234$6 = this.sci_Vector5__f_len1234;
      var data5$6 = this.sci_Vector5__f_data5;
      var suffix4$6 = this.sci_Vector5__f_suffix4;
      var suffix3$24 = this.sci_Vector5__f_suffix3;
      var suffix2$37 = this.sci_Vector5__f_suffix2;
      var suffix1$51 = this.sci_BigVector__f_suffix1;
      var length0$51 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector5(prefix1$48, len1$45, prefix2$37, len12$37, prefix3$24, len123$24, a4c$2, len1234$6, data5$6, suffix4$6, suffix3$24, suffix2$37, suffix1$51, length0$51);
    } else if ((index >= this.sci_Vector5__f_len12)) {
      var io$3 = ((index - this.sci_Vector5__f_len12) | 0);
      var a3$4 = this.sci_Vector5__f_prefix3;
      var idx3$1 = ((io$3 >>> 10) | 0);
      var idx2$1 = (31 & ((io$3 >>> 5) | 0));
      var idx1$1 = (31 & io$3);
      var this$27 = $n(a3$4);
      var a3c$4 = this$27.clone__O();
      var a2$5 = a3c$4.get(idx3$1);
      var this$28 = $n(a2$5);
      var a2c$5 = this$28.clone__O();
      var a1$6 = a2c$5.get(idx2$1);
      var this$29 = $n(a1$6);
      var a1c$6 = this$29.clone__O();
      a1c$6.set(idx1$1, elem);
      a2c$5.set(idx2$1, a1c$6);
      a3c$4.set(idx3$1, a2c$5);
      var prefix1$49 = this.sci_Vector__f_prefix1;
      var len1$46 = this.sci_Vector5__f_len1;
      var prefix2$38 = this.sci_Vector5__f_prefix2;
      var len12$38 = this.sci_Vector5__f_len12;
      var len123$25 = this.sci_Vector5__f_len123;
      var prefix4$7 = this.sci_Vector5__f_prefix4;
      var len1234$7 = this.sci_Vector5__f_len1234;
      var data5$7 = this.sci_Vector5__f_data5;
      var suffix4$7 = this.sci_Vector5__f_suffix4;
      var suffix3$25 = this.sci_Vector5__f_suffix3;
      var suffix2$38 = this.sci_Vector5__f_suffix2;
      var suffix1$52 = this.sci_BigVector__f_suffix1;
      var length0$52 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector5(prefix1$49, len1$46, prefix2$38, len12$38, a3c$4, len123$25, prefix4$7, len1234$7, data5$7, suffix4$7, suffix3$25, suffix2$38, suffix1$52, length0$52);
    } else if ((index >= this.sci_Vector5__f_len1)) {
      var io$4 = ((index - this.sci_Vector5__f_len1) | 0);
      var a2$6 = this.sci_Vector5__f_prefix2;
      var idx2$2 = ((io$4 >>> 5) | 0);
      var idx1$2 = (31 & io$4);
      var this$31 = $n(a2$6);
      var a2c$6 = this$31.clone__O();
      var a1$7 = a2c$6.get(idx2$2);
      var this$32 = $n(a1$7);
      var a1c$7 = this$32.clone__O();
      a1c$7.set(idx1$2, elem);
      a2c$6.set(idx2$2, a1c$7);
      var prefix1$50 = this.sci_Vector__f_prefix1;
      var len1$47 = this.sci_Vector5__f_len1;
      var len12$39 = this.sci_Vector5__f_len12;
      var prefix3$26 = this.sci_Vector5__f_prefix3;
      var len123$26 = this.sci_Vector5__f_len123;
      var prefix4$8 = this.sci_Vector5__f_prefix4;
      var len1234$8 = this.sci_Vector5__f_len1234;
      var data5$8 = this.sci_Vector5__f_data5;
      var suffix4$8 = this.sci_Vector5__f_suffix4;
      var suffix3$26 = this.sci_Vector5__f_suffix3;
      var suffix2$39 = this.sci_Vector5__f_suffix2;
      var suffix1$53 = this.sci_BigVector__f_suffix1;
      var length0$53 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector5(prefix1$50, len1$47, a2c$6, len12$39, prefix3$26, len123$26, prefix4$8, len1234$8, data5$8, suffix4$8, suffix3$26, suffix2$39, suffix1$53, length0$53);
    } else {
      var a1$8 = this.sci_Vector__f_prefix1;
      var this$34 = $n(a1$8);
      var a1c$8 = this$34.clone__O();
      a1c$8.set(index, elem);
      var len1 = this.sci_Vector5__f_len1;
      var prefix2 = this.sci_Vector5__f_prefix2;
      var len12 = this.sci_Vector5__f_len12;
      var prefix3 = this.sci_Vector5__f_prefix3;
      var len123 = this.sci_Vector5__f_len123;
      var prefix4 = this.sci_Vector5__f_prefix4;
      var len1234 = this.sci_Vector5__f_len1234;
      var data5 = this.sci_Vector5__f_data5;
      var suffix4 = this.sci_Vector5__f_suffix4;
      var suffix3 = this.sci_Vector5__f_suffix3;
      var suffix2 = this.sci_Vector5__f_suffix2;
      var suffix1 = this.sci_BigVector__f_suffix1;
      var length0 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector5(a1c$8, len1, prefix2, len12, prefix3, len123, prefix4, len1234, data5, suffix4, suffix3, suffix2, suffix1, length0);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector5.prototype.appended__O__sci_Vector = (function(elem) {
  if (($n(this.sci_BigVector__f_suffix1).u.length < 32)) {
    var suffix1$54 = $m_sci_VectorStatics$().copyAppend1__AO__O__AO(this.sci_BigVector__f_suffix1, elem);
    var length0$54 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$51 = this.sci_Vector__f_prefix1;
    var len1$48 = this.sci_Vector5__f_len1;
    var prefix2$40 = this.sci_Vector5__f_prefix2;
    var len12$40 = this.sci_Vector5__f_len12;
    var prefix3$27 = this.sci_Vector5__f_prefix3;
    var len123$27 = this.sci_Vector5__f_len123;
    var prefix4$9 = this.sci_Vector5__f_prefix4;
    var len1234$9 = this.sci_Vector5__f_len1234;
    var data5$9 = this.sci_Vector5__f_data5;
    var suffix4$9 = this.sci_Vector5__f_suffix4;
    var suffix3$27 = this.sci_Vector5__f_suffix3;
    var suffix2$40 = this.sci_Vector5__f_suffix2;
    return new $c_sci_Vector5(prefix1$51, len1$48, prefix2$40, len12$40, prefix3$27, len123$27, prefix4$9, len1234$9, data5$9, suffix4$9, suffix3$27, suffix2$40, suffix1$54, length0$54);
  } else if (($n(this.sci_Vector5__f_suffix2).u.length < 31)) {
    var suffix2$41 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix2, this.sci_BigVector__f_suffix1), 2);
    var a = new $ac_O(1);
    a.set(0, elem);
    var length0$55 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$52 = this.sci_Vector__f_prefix1;
    var len1$49 = this.sci_Vector5__f_len1;
    var prefix2$41 = this.sci_Vector5__f_prefix2;
    var len12$41 = this.sci_Vector5__f_len12;
    var prefix3$28 = this.sci_Vector5__f_prefix3;
    var len123$28 = this.sci_Vector5__f_len123;
    var prefix4$10 = this.sci_Vector5__f_prefix4;
    var len1234$10 = this.sci_Vector5__f_len1234;
    var data5$10 = this.sci_Vector5__f_data5;
    var suffix4$10 = this.sci_Vector5__f_suffix4;
    var suffix3$28 = this.sci_Vector5__f_suffix3;
    return new $c_sci_Vector5(prefix1$52, len1$49, prefix2$41, len12$41, prefix3$28, len123$28, prefix4$10, len1234$10, data5$10, suffix4$10, suffix3$28, suffix2$41, a, length0$55);
  } else if (($n(this.sci_Vector5__f_suffix3).u.length < 31)) {
    var suffix3$29 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix2, this.sci_BigVector__f_suffix1)), 3);
    var a$1 = new $ac_O(1);
    a$1.set(0, elem);
    var length0$56 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$53 = this.sci_Vector__f_prefix1;
    var len1$50 = this.sci_Vector5__f_len1;
    var prefix2$42 = this.sci_Vector5__f_prefix2;
    var len12$42 = this.sci_Vector5__f_len12;
    var prefix3$29 = this.sci_Vector5__f_prefix3;
    var len123$29 = this.sci_Vector5__f_len123;
    var prefix4$11 = this.sci_Vector5__f_prefix4;
    var len1234$11 = this.sci_Vector5__f_len1234;
    var data5$11 = this.sci_Vector5__f_data5;
    var suffix4$11 = this.sci_Vector5__f_suffix4;
    var suffix2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector5(prefix1$53, len1$50, prefix2$42, len12$42, prefix3$29, len123$29, prefix4$11, len1234$11, data5$11, suffix4$11, suffix3$29, suffix2, a$1, length0$56);
  } else if (($n(this.sci_Vector5__f_suffix4).u.length < 31)) {
    var suffix4$12 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix2, this.sci_BigVector__f_suffix1))), 4);
    var a$2 = new $ac_O(1);
    a$2.set(0, elem);
    var length0$57 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$54 = this.sci_Vector__f_prefix1;
    var len1$51 = this.sci_Vector5__f_len1;
    var prefix2$43 = this.sci_Vector5__f_prefix2;
    var len12$43 = this.sci_Vector5__f_len12;
    var prefix3$30 = this.sci_Vector5__f_prefix3;
    var len123$30 = this.sci_Vector5__f_len123;
    var prefix4$12 = this.sci_Vector5__f_prefix4;
    var len1234$12 = this.sci_Vector5__f_len1234;
    var data5$12 = this.sci_Vector5__f_data5;
    var suffix3 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var suffix2$1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector5(prefix1$54, len1$51, prefix2$43, len12$43, prefix3$30, len123$30, prefix4$12, len1234$12, data5$12, suffix4$12, suffix3, suffix2$1, a$2, length0$57);
  } else if (($n(this.sci_Vector5__f_data5).u.length < 30)) {
    var data5$13 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_data5, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix2, this.sci_BigVector__f_suffix1)))), 5);
    var a$3 = new $ac_O(1);
    a$3.set(0, elem);
    var length0$58 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$55 = this.sci_Vector__f_prefix1;
    var len1$52 = this.sci_Vector5__f_len1;
    var prefix2$44 = this.sci_Vector5__f_prefix2;
    var len12$44 = this.sci_Vector5__f_len12;
    var prefix3$31 = this.sci_Vector5__f_prefix3;
    var len123$31 = this.sci_Vector5__f_len123;
    var prefix4$13 = this.sci_Vector5__f_prefix4;
    var len1234$13 = this.sci_Vector5__f_len1234;
    var suffix4 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty4;
    var suffix3$1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var suffix2$2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector5(prefix1$55, len1$52, prefix2$44, len12$44, prefix3$31, len123$31, prefix4$13, len1234$13, data5$13, suffix4, suffix3$1, suffix2$2, a$3, length0$58);
  } else {
    var $x_14 = this.sci_Vector__f_prefix1;
    var $x_13 = this.sci_Vector5__f_len1;
    var $x_12 = this.sci_Vector5__f_prefix2;
    var $x_11 = this.sci_Vector5__f_len12;
    var $x_10 = this.sci_Vector5__f_prefix3;
    var $x_9 = this.sci_Vector5__f_len123;
    var $x_8 = this.sci_Vector5__f_prefix4;
    var $x_7 = this.sci_Vector5__f_len1234;
    var $x_6 = this.sci_Vector5__f_data5;
    var $x_5 = this.sci_Vector5__f_len1234;
    var $x_4 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty6;
    var x = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector5__f_suffix2, this.sci_BigVector__f_suffix1))), 4);
    var a$4 = new ($d_O.getArrayOf().getArrayOf().getArrayOf().getArrayOf().getArrayOf().constr)(1);
    a$4.set(0, x);
    var $x_3 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty4;
    var $x_2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var $x_1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    var a$5 = new $ac_O(1);
    a$5.set(0, elem);
    return new $c_sci_Vector6($x_14, $x_13, $x_12, $x_11, $x_10, $x_9, $x_8, $x_7, $x_6, ((31457280 + $x_5) | 0), $x_4, a$4, $x_3, $x_2, $x_1, a$5, ((1 + this.sci_BigVector__f_length0) | 0));
  }
});
$c_sci_Vector5.prototype.vectorSliceCount__I = (function() {
  return 9;
});
$c_sci_Vector5.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.sci_Vector__f_prefix1;
      break;
    }
    case 1: {
      return this.sci_Vector5__f_prefix2;
      break;
    }
    case 2: {
      return this.sci_Vector5__f_prefix3;
      break;
    }
    case 3: {
      return this.sci_Vector5__f_prefix4;
      break;
    }
    case 4: {
      return this.sci_Vector5__f_data5;
      break;
    }
    case 5: {
      return this.sci_Vector5__f_suffix4;
      break;
    }
    case 6: {
      return this.sci_Vector5__f_suffix3;
      break;
    }
    case 7: {
      return this.sci_Vector5__f_suffix2;
      break;
    }
    case 8: {
      return this.sci_BigVector__f_suffix1;
      break;
    }
    default: {
      throw new $c_s_MatchError(idx);
    }
  }
});
$c_sci_Vector5.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector5__f_len1234) | 0);
    if ((io >= 0)) {
      var i5 = ((io >>> 20) | 0);
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i5 < $n(this.sci_Vector5__f_data5).u.length) ? $n($n($n($n($n(this.sci_Vector5__f_data5).get(i5)).get(i4)).get(i3)).get(i2)).get(i1) : ((i4 < $n(this.sci_Vector5__f_suffix4).u.length) ? $n($n($n($n(this.sci_Vector5__f_suffix4).get(i4)).get(i3)).get(i2)).get(i1) : ((i3 < $n(this.sci_Vector5__f_suffix3).u.length) ? $n($n($n(this.sci_Vector5__f_suffix3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector5__f_suffix2).u.length) ? $n($n(this.sci_Vector5__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1)))));
    } else if ((index >= this.sci_Vector5__f_len123)) {
      var io$2 = ((index - this.sci_Vector5__f_len123) | 0);
      return $n($n($n($n(this.sci_Vector5__f_prefix4).get(((io$2 >>> 15) | 0))).get((31 & ((io$2 >>> 10) | 0)))).get((31 & ((io$2 >>> 5) | 0)))).get((31 & io$2));
    } else if ((index >= this.sci_Vector5__f_len12)) {
      var io$3 = ((index - this.sci_Vector5__f_len12) | 0);
      return $n($n($n(this.sci_Vector5__f_prefix3).get(((io$3 >>> 10) | 0))).get((31 & ((io$3 >>> 5) | 0)))).get((31 & io$3));
    } else if ((index >= this.sci_Vector5__f_len1)) {
      var io$4 = ((index - this.sci_Vector5__f_len1) | 0);
      return $n($n(this.sci_Vector5__f_prefix2).get(((io$4 >>> 5) | 0))).get((31 & io$4));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
function $as_sci_Vector5(obj) {
  return (((obj instanceof $c_sci_Vector5) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector5"));
}
function $isArrayOf_sci_Vector5(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector5)));
}
function $asArrayOf_sci_Vector5(obj, depth) {
  return (($isArrayOf_sci_Vector5(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector5;", depth));
}
var $d_sci_Vector5 = new $TypeData().initClass($c_sci_Vector5, "scala.collection.immutable.Vector5", ({
  sci_Vector5: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
/** @constructor */
function $c_sci_Vector6(_prefix1, len1, prefix2, len12, prefix3, len123, prefix4, len1234, prefix5, len12345, data6, suffix5, suffix4, suffix3, suffix2, _suffix1, _length0) {
  this.sci_Vector__f_prefix1 = null;
  this.sci_BigVector__f_suffix1 = null;
  this.sci_BigVector__f_length0 = 0;
  this.sci_Vector6__f_len1 = 0;
  this.sci_Vector6__f_prefix2 = null;
  this.sci_Vector6__f_len12 = 0;
  this.sci_Vector6__f_prefix3 = null;
  this.sci_Vector6__f_len123 = 0;
  this.sci_Vector6__f_prefix4 = null;
  this.sci_Vector6__f_len1234 = 0;
  this.sci_Vector6__f_prefix5 = null;
  this.sci_Vector6__f_len12345 = 0;
  this.sci_Vector6__f_data6 = null;
  this.sci_Vector6__f_suffix5 = null;
  this.sci_Vector6__f_suffix4 = null;
  this.sci_Vector6__f_suffix3 = null;
  this.sci_Vector6__f_suffix2 = null;
  this.sci_Vector6__f_len1 = len1;
  this.sci_Vector6__f_prefix2 = prefix2;
  this.sci_Vector6__f_len12 = len12;
  this.sci_Vector6__f_prefix3 = prefix3;
  this.sci_Vector6__f_len123 = len123;
  this.sci_Vector6__f_prefix4 = prefix4;
  this.sci_Vector6__f_len1234 = len1234;
  this.sci_Vector6__f_prefix5 = prefix5;
  this.sci_Vector6__f_len12345 = len12345;
  this.sci_Vector6__f_data6 = data6;
  this.sci_Vector6__f_suffix5 = suffix5;
  this.sci_Vector6__f_suffix4 = suffix4;
  this.sci_Vector6__f_suffix3 = suffix3;
  this.sci_Vector6__f_suffix2 = suffix2;
  $ct_sci_BigVector__AO__AO__I__(this, _prefix1, _suffix1, _length0);
}
$c_sci_Vector6.prototype = new $h_sci_BigVector();
$c_sci_Vector6.prototype.constructor = $c_sci_Vector6;
/** @constructor */
function $h_sci_Vector6() {
}
$h_sci_Vector6.prototype = $c_sci_Vector6.prototype;
$c_sci_Vector6.prototype.apply__I__O = (function(index) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector6__f_len12345) | 0);
    if ((io >= 0)) {
      var i6 = ((io >>> 25) | 0);
      var i5 = (31 & ((io >>> 20) | 0));
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i6 < $n(this.sci_Vector6__f_data6).u.length) ? $n($n($n($n($n($n(this.sci_Vector6__f_data6).get(i6)).get(i5)).get(i4)).get(i3)).get(i2)).get(i1) : ((i5 < $n(this.sci_Vector6__f_suffix5).u.length) ? $n($n($n($n($n(this.sci_Vector6__f_suffix5).get(i5)).get(i4)).get(i3)).get(i2)).get(i1) : ((i4 < $n(this.sci_Vector6__f_suffix4).u.length) ? $n($n($n($n(this.sci_Vector6__f_suffix4).get(i4)).get(i3)).get(i2)).get(i1) : ((i3 < $n(this.sci_Vector6__f_suffix3).u.length) ? $n($n($n(this.sci_Vector6__f_suffix3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector6__f_suffix2).u.length) ? $n($n(this.sci_Vector6__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1))))));
    } else if ((index >= this.sci_Vector6__f_len1234)) {
      var io$2 = ((index - this.sci_Vector6__f_len1234) | 0);
      return $n($n($n($n($n(this.sci_Vector6__f_prefix5).get(((io$2 >>> 20) | 0))).get((31 & ((io$2 >>> 15) | 0)))).get((31 & ((io$2 >>> 10) | 0)))).get((31 & ((io$2 >>> 5) | 0)))).get((31 & io$2));
    } else if ((index >= this.sci_Vector6__f_len123)) {
      var io$3 = ((index - this.sci_Vector6__f_len123) | 0);
      return $n($n($n($n(this.sci_Vector6__f_prefix4).get(((io$3 >>> 15) | 0))).get((31 & ((io$3 >>> 10) | 0)))).get((31 & ((io$3 >>> 5) | 0)))).get((31 & io$3));
    } else if ((index >= this.sci_Vector6__f_len12)) {
      var io$4 = ((index - this.sci_Vector6__f_len12) | 0);
      return $n($n($n(this.sci_Vector6__f_prefix3).get(((io$4 >>> 10) | 0))).get((31 & ((io$4 >>> 5) | 0)))).get((31 & io$4));
    } else if ((index >= this.sci_Vector6__f_len1)) {
      var io$5 = ((index - this.sci_Vector6__f_len1) | 0);
      return $n($n(this.sci_Vector6__f_prefix2).get(((io$5 >>> 5) | 0))).get((31 & io$5));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector6.prototype.updated__I__O__sci_Vector = (function(index, elem) {
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    if ((index >= this.sci_Vector6__f_len12345)) {
      var io = ((index - this.sci_Vector6__f_len12345) | 0);
      var i6 = ((io >>> 25) | 0);
      var i5 = (31 & ((io >>> 20) | 0));
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      if ((i6 < $n(this.sci_Vector6__f_data6).u.length)) {
        var a6 = this.sci_Vector6__f_data6;
        var this$2 = $n(a6);
        var a6c = this$2.clone__O();
        var a5 = a6c.get(i6);
        var this$3 = $n(a5);
        var a5c = this$3.clone__O();
        var a4 = a5c.get(i5);
        var this$4 = $n(a4);
        var a4c = this$4.clone__O();
        var a3 = a4c.get(i4);
        var this$5 = $n(a3);
        var a3c = this$5.clone__O();
        var a2 = a3c.get(i3);
        var this$6 = $n(a2);
        var a2c = this$6.clone__O();
        var a1 = a2c.get(i2);
        var this$7 = $n(a1);
        var a1c = this$7.clone__O();
        a1c.set(i1, elem);
        a2c.set(i2, a1c);
        a3c.set(i3, a2c);
        a4c.set(i4, a3c);
        a5c.set(i5, a4c);
        a6c.set(i6, a5c);
        var prefix1$65 = this.sci_Vector__f_prefix1;
        var len1$59 = this.sci_Vector6__f_len1;
        var prefix2$52 = this.sci_Vector6__f_prefix2;
        var len12$52 = this.sci_Vector6__f_len12;
        var prefix3$40 = this.sci_Vector6__f_prefix3;
        var len123$40 = this.sci_Vector6__f_len123;
        var prefix4$23 = this.sci_Vector6__f_prefix4;
        var len1234$23 = this.sci_Vector6__f_len1234;
        var prefix5$1 = this.sci_Vector6__f_prefix5;
        var len12345$1 = this.sci_Vector6__f_len12345;
        var suffix5$1 = this.sci_Vector6__f_suffix5;
        var suffix4$23 = this.sci_Vector6__f_suffix4;
        var suffix3$40 = this.sci_Vector6__f_suffix3;
        var suffix2$52 = this.sci_Vector6__f_suffix2;
        var suffix1$69 = this.sci_BigVector__f_suffix1;
        var length0$69 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector6(prefix1$65, len1$59, prefix2$52, len12$52, prefix3$40, len123$40, prefix4$23, len1234$23, prefix5$1, len12345$1, a6c, suffix5$1, suffix4$23, suffix3$40, suffix2$52, suffix1$69, length0$69);
      } else if ((i5 < $n(this.sci_Vector6__f_suffix5).u.length)) {
        var a5$1 = this.sci_Vector6__f_suffix5;
        var this$9 = $n(a5$1);
        var a5c$1 = this$9.clone__O();
        var a4$1 = a5c$1.get(i5);
        var this$10 = $n(a4$1);
        var a4c$1 = this$10.clone__O();
        var a3$1 = a4c$1.get(i4);
        var this$11 = $n(a3$1);
        var a3c$1 = this$11.clone__O();
        var a2$1 = a3c$1.get(i3);
        var this$12 = $n(a2$1);
        var a2c$1 = this$12.clone__O();
        var a1$1 = a2c$1.get(i2);
        var this$13 = $n(a1$1);
        var a1c$1 = this$13.clone__O();
        a1c$1.set(i1, elem);
        a2c$1.set(i2, a1c$1);
        a3c$1.set(i3, a2c$1);
        a4c$1.set(i4, a3c$1);
        a5c$1.set(i5, a4c$1);
        var prefix1$66 = this.sci_Vector__f_prefix1;
        var len1$60 = this.sci_Vector6__f_len1;
        var prefix2$53 = this.sci_Vector6__f_prefix2;
        var len12$53 = this.sci_Vector6__f_len12;
        var prefix3$41 = this.sci_Vector6__f_prefix3;
        var len123$41 = this.sci_Vector6__f_len123;
        var prefix4$24 = this.sci_Vector6__f_prefix4;
        var len1234$24 = this.sci_Vector6__f_len1234;
        var prefix5$2 = this.sci_Vector6__f_prefix5;
        var len12345$2 = this.sci_Vector6__f_len12345;
        var data6$2 = this.sci_Vector6__f_data6;
        var suffix4$24 = this.sci_Vector6__f_suffix4;
        var suffix3$41 = this.sci_Vector6__f_suffix3;
        var suffix2$53 = this.sci_Vector6__f_suffix2;
        var suffix1$70 = this.sci_BigVector__f_suffix1;
        var length0$70 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector6(prefix1$66, len1$60, prefix2$53, len12$53, prefix3$41, len123$41, prefix4$24, len1234$24, prefix5$2, len12345$2, data6$2, a5c$1, suffix4$24, suffix3$41, suffix2$53, suffix1$70, length0$70);
      } else if ((i4 < $n(this.sci_Vector6__f_suffix4).u.length)) {
        var a4$2 = this.sci_Vector6__f_suffix4;
        var this$15 = $n(a4$2);
        var a4c$2 = this$15.clone__O();
        var a3$2 = a4c$2.get(i4);
        var this$16 = $n(a3$2);
        var a3c$2 = this$16.clone__O();
        var a2$2 = a3c$2.get(i3);
        var this$17 = $n(a2$2);
        var a2c$2 = this$17.clone__O();
        var a1$2 = a2c$2.get(i2);
        var this$18 = $n(a1$2);
        var a1c$2 = this$18.clone__O();
        a1c$2.set(i1, elem);
        a2c$2.set(i2, a1c$2);
        a3c$2.set(i3, a2c$2);
        a4c$2.set(i4, a3c$2);
        var prefix1$67 = this.sci_Vector__f_prefix1;
        var len1$61 = this.sci_Vector6__f_len1;
        var prefix2$54 = this.sci_Vector6__f_prefix2;
        var len12$54 = this.sci_Vector6__f_len12;
        var prefix3$42 = this.sci_Vector6__f_prefix3;
        var len123$42 = this.sci_Vector6__f_len123;
        var prefix4$25 = this.sci_Vector6__f_prefix4;
        var len1234$25 = this.sci_Vector6__f_len1234;
        var prefix5$3 = this.sci_Vector6__f_prefix5;
        var len12345$3 = this.sci_Vector6__f_len12345;
        var data6$3 = this.sci_Vector6__f_data6;
        var suffix5$3 = this.sci_Vector6__f_suffix5;
        var suffix3$42 = this.sci_Vector6__f_suffix3;
        var suffix2$54 = this.sci_Vector6__f_suffix2;
        var suffix1$71 = this.sci_BigVector__f_suffix1;
        var length0$71 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector6(prefix1$67, len1$61, prefix2$54, len12$54, prefix3$42, len123$42, prefix4$25, len1234$25, prefix5$3, len12345$3, data6$3, suffix5$3, a4c$2, suffix3$42, suffix2$54, suffix1$71, length0$71);
      } else if ((i3 < $n(this.sci_Vector6__f_suffix3).u.length)) {
        var a3$3 = this.sci_Vector6__f_suffix3;
        var this$20 = $n(a3$3);
        var a3c$3 = this$20.clone__O();
        var a2$3 = a3c$3.get(i3);
        var this$21 = $n(a2$3);
        var a2c$3 = this$21.clone__O();
        var a1$3 = a2c$3.get(i2);
        var this$22 = $n(a1$3);
        var a1c$3 = this$22.clone__O();
        a1c$3.set(i1, elem);
        a2c$3.set(i2, a1c$3);
        a3c$3.set(i3, a2c$3);
        var prefix1$68 = this.sci_Vector__f_prefix1;
        var len1$62 = this.sci_Vector6__f_len1;
        var prefix2$55 = this.sci_Vector6__f_prefix2;
        var len12$55 = this.sci_Vector6__f_len12;
        var prefix3$43 = this.sci_Vector6__f_prefix3;
        var len123$43 = this.sci_Vector6__f_len123;
        var prefix4$26 = this.sci_Vector6__f_prefix4;
        var len1234$26 = this.sci_Vector6__f_len1234;
        var prefix5$4 = this.sci_Vector6__f_prefix5;
        var len12345$4 = this.sci_Vector6__f_len12345;
        var data6$4 = this.sci_Vector6__f_data6;
        var suffix5$4 = this.sci_Vector6__f_suffix5;
        var suffix4$26 = this.sci_Vector6__f_suffix4;
        var suffix2$55 = this.sci_Vector6__f_suffix2;
        var suffix1$72 = this.sci_BigVector__f_suffix1;
        var length0$72 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector6(prefix1$68, len1$62, prefix2$55, len12$55, prefix3$43, len123$43, prefix4$26, len1234$26, prefix5$4, len12345$4, data6$4, suffix5$4, suffix4$26, a3c$3, suffix2$55, suffix1$72, length0$72);
      } else if ((i2 < $n(this.sci_Vector6__f_suffix2).u.length)) {
        var a2$4 = this.sci_Vector6__f_suffix2;
        var this$24 = $n(a2$4);
        var a2c$4 = this$24.clone__O();
        var a1$4 = a2c$4.get(i2);
        var this$25 = $n(a1$4);
        var a1c$4 = this$25.clone__O();
        a1c$4.set(i1, elem);
        a2c$4.set(i2, a1c$4);
        var prefix1$69 = this.sci_Vector__f_prefix1;
        var len1$63 = this.sci_Vector6__f_len1;
        var prefix2$56 = this.sci_Vector6__f_prefix2;
        var len12$56 = this.sci_Vector6__f_len12;
        var prefix3$44 = this.sci_Vector6__f_prefix3;
        var len123$44 = this.sci_Vector6__f_len123;
        var prefix4$27 = this.sci_Vector6__f_prefix4;
        var len1234$27 = this.sci_Vector6__f_len1234;
        var prefix5$5 = this.sci_Vector6__f_prefix5;
        var len12345$5 = this.sci_Vector6__f_len12345;
        var data6$5 = this.sci_Vector6__f_data6;
        var suffix5$5 = this.sci_Vector6__f_suffix5;
        var suffix4$27 = this.sci_Vector6__f_suffix4;
        var suffix3$44 = this.sci_Vector6__f_suffix3;
        var suffix1$73 = this.sci_BigVector__f_suffix1;
        var length0$73 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector6(prefix1$69, len1$63, prefix2$56, len12$56, prefix3$44, len123$44, prefix4$27, len1234$27, prefix5$5, len12345$5, data6$5, suffix5$5, suffix4$27, suffix3$44, a2c$4, suffix1$73, length0$73);
      } else {
        var a1$5 = this.sci_BigVector__f_suffix1;
        var this$27 = $n(a1$5);
        var a1c$5 = this$27.clone__O();
        a1c$5.set(i1, elem);
        var prefix1$70 = this.sci_Vector__f_prefix1;
        var len1$64 = this.sci_Vector6__f_len1;
        var prefix2$57 = this.sci_Vector6__f_prefix2;
        var len12$57 = this.sci_Vector6__f_len12;
        var prefix3$45 = this.sci_Vector6__f_prefix3;
        var len123$45 = this.sci_Vector6__f_len123;
        var prefix4$28 = this.sci_Vector6__f_prefix4;
        var len1234$28 = this.sci_Vector6__f_len1234;
        var prefix5$6 = this.sci_Vector6__f_prefix5;
        var len12345$6 = this.sci_Vector6__f_len12345;
        var data6$6 = this.sci_Vector6__f_data6;
        var suffix5$6 = this.sci_Vector6__f_suffix5;
        var suffix4$28 = this.sci_Vector6__f_suffix4;
        var suffix3$45 = this.sci_Vector6__f_suffix3;
        var suffix2$57 = this.sci_Vector6__f_suffix2;
        var length0$74 = this.sci_BigVector__f_length0;
        return new $c_sci_Vector6(prefix1$70, len1$64, prefix2$57, len12$57, prefix3$45, len123$45, prefix4$28, len1234$28, prefix5$6, len12345$6, data6$6, suffix5$6, suffix4$28, suffix3$45, suffix2$57, a1c$5, length0$74);
      }
    } else if ((index >= this.sci_Vector6__f_len1234)) {
      var io$2 = ((index - this.sci_Vector6__f_len1234) | 0);
      var a5$2 = this.sci_Vector6__f_prefix5;
      var idx5 = ((io$2 >>> 20) | 0);
      var idx4 = (31 & ((io$2 >>> 15) | 0));
      var idx3 = (31 & ((io$2 >>> 10) | 0));
      var idx2 = (31 & ((io$2 >>> 5) | 0));
      var idx1 = (31 & io$2);
      var this$29 = $n(a5$2);
      var a5c$2 = this$29.clone__O();
      var a4$3 = a5c$2.get(idx5);
      var this$30 = $n(a4$3);
      var a4c$3 = this$30.clone__O();
      var a3$4 = a4c$3.get(idx4);
      var this$31 = $n(a3$4);
      var a3c$4 = this$31.clone__O();
      var a2$5 = a3c$4.get(idx3);
      var this$32 = $n(a2$5);
      var a2c$5 = this$32.clone__O();
      var a1$6 = a2c$5.get(idx2);
      var this$33 = $n(a1$6);
      var a1c$6 = this$33.clone__O();
      a1c$6.set(idx1, elem);
      a2c$5.set(idx2, a1c$6);
      a3c$4.set(idx3, a2c$5);
      a4c$3.set(idx4, a3c$4);
      a5c$2.set(idx5, a4c$3);
      var prefix1$71 = this.sci_Vector__f_prefix1;
      var len1$65 = this.sci_Vector6__f_len1;
      var prefix2$58 = this.sci_Vector6__f_prefix2;
      var len12$58 = this.sci_Vector6__f_len12;
      var prefix3$46 = this.sci_Vector6__f_prefix3;
      var len123$46 = this.sci_Vector6__f_len123;
      var prefix4$29 = this.sci_Vector6__f_prefix4;
      var len1234$29 = this.sci_Vector6__f_len1234;
      var len12345$7 = this.sci_Vector6__f_len12345;
      var data6$7 = this.sci_Vector6__f_data6;
      var suffix5$7 = this.sci_Vector6__f_suffix5;
      var suffix4$29 = this.sci_Vector6__f_suffix4;
      var suffix3$46 = this.sci_Vector6__f_suffix3;
      var suffix2$58 = this.sci_Vector6__f_suffix2;
      var suffix1$75 = this.sci_BigVector__f_suffix1;
      var length0$75 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector6(prefix1$71, len1$65, prefix2$58, len12$58, prefix3$46, len123$46, prefix4$29, len1234$29, a5c$2, len12345$7, data6$7, suffix5$7, suffix4$29, suffix3$46, suffix2$58, suffix1$75, length0$75);
    } else if ((index >= this.sci_Vector6__f_len123)) {
      var io$3 = ((index - this.sci_Vector6__f_len123) | 0);
      var a4$4 = this.sci_Vector6__f_prefix4;
      var idx4$1 = ((io$3 >>> 15) | 0);
      var idx3$1 = (31 & ((io$3 >>> 10) | 0));
      var idx2$1 = (31 & ((io$3 >>> 5) | 0));
      var idx1$1 = (31 & io$3);
      var this$35 = $n(a4$4);
      var a4c$4 = this$35.clone__O();
      var a3$5 = a4c$4.get(idx4$1);
      var this$36 = $n(a3$5);
      var a3c$5 = this$36.clone__O();
      var a2$6 = a3c$5.get(idx3$1);
      var this$37 = $n(a2$6);
      var a2c$6 = this$37.clone__O();
      var a1$7 = a2c$6.get(idx2$1);
      var this$38 = $n(a1$7);
      var a1c$7 = this$38.clone__O();
      a1c$7.set(idx1$1, elem);
      a2c$6.set(idx2$1, a1c$7);
      a3c$5.set(idx3$1, a2c$6);
      a4c$4.set(idx4$1, a3c$5);
      var prefix1$72 = this.sci_Vector__f_prefix1;
      var len1$66 = this.sci_Vector6__f_len1;
      var prefix2$59 = this.sci_Vector6__f_prefix2;
      var len12$59 = this.sci_Vector6__f_len12;
      var prefix3$47 = this.sci_Vector6__f_prefix3;
      var len123$47 = this.sci_Vector6__f_len123;
      var len1234$30 = this.sci_Vector6__f_len1234;
      var prefix5$8 = this.sci_Vector6__f_prefix5;
      var len12345$8 = this.sci_Vector6__f_len12345;
      var data6$8 = this.sci_Vector6__f_data6;
      var suffix5$8 = this.sci_Vector6__f_suffix5;
      var suffix4$30 = this.sci_Vector6__f_suffix4;
      var suffix3$47 = this.sci_Vector6__f_suffix3;
      var suffix2$59 = this.sci_Vector6__f_suffix2;
      var suffix1$76 = this.sci_BigVector__f_suffix1;
      var length0$76 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector6(prefix1$72, len1$66, prefix2$59, len12$59, prefix3$47, len123$47, a4c$4, len1234$30, prefix5$8, len12345$8, data6$8, suffix5$8, suffix4$30, suffix3$47, suffix2$59, suffix1$76, length0$76);
    } else if ((index >= this.sci_Vector6__f_len12)) {
      var io$4 = ((index - this.sci_Vector6__f_len12) | 0);
      var a3$6 = this.sci_Vector6__f_prefix3;
      var idx3$2 = ((io$4 >>> 10) | 0);
      var idx2$2 = (31 & ((io$4 >>> 5) | 0));
      var idx1$2 = (31 & io$4);
      var this$40 = $n(a3$6);
      var a3c$6 = this$40.clone__O();
      var a2$7 = a3c$6.get(idx3$2);
      var this$41 = $n(a2$7);
      var a2c$7 = this$41.clone__O();
      var a1$8 = a2c$7.get(idx2$2);
      var this$42 = $n(a1$8);
      var a1c$8 = this$42.clone__O();
      a1c$8.set(idx1$2, elem);
      a2c$7.set(idx2$2, a1c$8);
      a3c$6.set(idx3$2, a2c$7);
      var prefix1$73 = this.sci_Vector__f_prefix1;
      var len1$67 = this.sci_Vector6__f_len1;
      var prefix2$60 = this.sci_Vector6__f_prefix2;
      var len12$60 = this.sci_Vector6__f_len12;
      var len123$48 = this.sci_Vector6__f_len123;
      var prefix4$31 = this.sci_Vector6__f_prefix4;
      var len1234$31 = this.sci_Vector6__f_len1234;
      var prefix5$9 = this.sci_Vector6__f_prefix5;
      var len12345$9 = this.sci_Vector6__f_len12345;
      var data6$9 = this.sci_Vector6__f_data6;
      var suffix5$9 = this.sci_Vector6__f_suffix5;
      var suffix4$31 = this.sci_Vector6__f_suffix4;
      var suffix3$48 = this.sci_Vector6__f_suffix3;
      var suffix2$60 = this.sci_Vector6__f_suffix2;
      var suffix1$77 = this.sci_BigVector__f_suffix1;
      var length0$77 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector6(prefix1$73, len1$67, prefix2$60, len12$60, a3c$6, len123$48, prefix4$31, len1234$31, prefix5$9, len12345$9, data6$9, suffix5$9, suffix4$31, suffix3$48, suffix2$60, suffix1$77, length0$77);
    } else if ((index >= this.sci_Vector6__f_len1)) {
      var io$5 = ((index - this.sci_Vector6__f_len1) | 0);
      var a2$8 = this.sci_Vector6__f_prefix2;
      var idx2$3 = ((io$5 >>> 5) | 0);
      var idx1$3 = (31 & io$5);
      var this$44 = $n(a2$8);
      var a2c$8 = this$44.clone__O();
      var a1$9 = a2c$8.get(idx2$3);
      var this$45 = $n(a1$9);
      var a1c$9 = this$45.clone__O();
      a1c$9.set(idx1$3, elem);
      a2c$8.set(idx2$3, a1c$9);
      var prefix1$74 = this.sci_Vector__f_prefix1;
      var len1$68 = this.sci_Vector6__f_len1;
      var len12$61 = this.sci_Vector6__f_len12;
      var prefix3$49 = this.sci_Vector6__f_prefix3;
      var len123$49 = this.sci_Vector6__f_len123;
      var prefix4$32 = this.sci_Vector6__f_prefix4;
      var len1234$32 = this.sci_Vector6__f_len1234;
      var prefix5$10 = this.sci_Vector6__f_prefix5;
      var len12345$10 = this.sci_Vector6__f_len12345;
      var data6$10 = this.sci_Vector6__f_data6;
      var suffix5$10 = this.sci_Vector6__f_suffix5;
      var suffix4$32 = this.sci_Vector6__f_suffix4;
      var suffix3$49 = this.sci_Vector6__f_suffix3;
      var suffix2$61 = this.sci_Vector6__f_suffix2;
      var suffix1$78 = this.sci_BigVector__f_suffix1;
      var length0$78 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector6(prefix1$74, len1$68, a2c$8, len12$61, prefix3$49, len123$49, prefix4$32, len1234$32, prefix5$10, len12345$10, data6$10, suffix5$10, suffix4$32, suffix3$49, suffix2$61, suffix1$78, length0$78);
    } else {
      var a1$10 = this.sci_Vector__f_prefix1;
      var this$47 = $n(a1$10);
      var a1c$10 = this$47.clone__O();
      a1c$10.set(index, elem);
      var len1 = this.sci_Vector6__f_len1;
      var prefix2 = this.sci_Vector6__f_prefix2;
      var len12 = this.sci_Vector6__f_len12;
      var prefix3 = this.sci_Vector6__f_prefix3;
      var len123 = this.sci_Vector6__f_len123;
      var prefix4 = this.sci_Vector6__f_prefix4;
      var len1234 = this.sci_Vector6__f_len1234;
      var prefix5 = this.sci_Vector6__f_prefix5;
      var len12345 = this.sci_Vector6__f_len12345;
      var data6 = this.sci_Vector6__f_data6;
      var suffix5 = this.sci_Vector6__f_suffix5;
      var suffix4 = this.sci_Vector6__f_suffix4;
      var suffix3 = this.sci_Vector6__f_suffix3;
      var suffix2 = this.sci_Vector6__f_suffix2;
      var suffix1 = this.sci_BigVector__f_suffix1;
      var length0 = this.sci_BigVector__f_length0;
      return new $c_sci_Vector6(a1c$10, len1, prefix2, len12, prefix3, len123, prefix4, len1234, prefix5, len12345, data6, suffix5, suffix4, suffix3, suffix2, suffix1, length0);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
$c_sci_Vector6.prototype.appended__O__sci_Vector = (function(elem) {
  if (($n(this.sci_BigVector__f_suffix1).u.length < 32)) {
    var suffix1$79 = $m_sci_VectorStatics$().copyAppend1__AO__O__AO(this.sci_BigVector__f_suffix1, elem);
    var length0$79 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$75 = this.sci_Vector__f_prefix1;
    var len1$69 = this.sci_Vector6__f_len1;
    var prefix2$62 = this.sci_Vector6__f_prefix2;
    var len12$62 = this.sci_Vector6__f_len12;
    var prefix3$50 = this.sci_Vector6__f_prefix3;
    var len123$50 = this.sci_Vector6__f_len123;
    var prefix4$33 = this.sci_Vector6__f_prefix4;
    var len1234$33 = this.sci_Vector6__f_len1234;
    var prefix5$11 = this.sci_Vector6__f_prefix5;
    var len12345$11 = this.sci_Vector6__f_len12345;
    var data6$11 = this.sci_Vector6__f_data6;
    var suffix5$11 = this.sci_Vector6__f_suffix5;
    var suffix4$33 = this.sci_Vector6__f_suffix4;
    var suffix3$50 = this.sci_Vector6__f_suffix3;
    var suffix2$62 = this.sci_Vector6__f_suffix2;
    return new $c_sci_Vector6(prefix1$75, len1$69, prefix2$62, len12$62, prefix3$50, len123$50, prefix4$33, len1234$33, prefix5$11, len12345$11, data6$11, suffix5$11, suffix4$33, suffix3$50, suffix2$62, suffix1$79, length0$79);
  } else if (($n(this.sci_Vector6__f_suffix2).u.length < 31)) {
    var suffix2$63 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix2, this.sci_BigVector__f_suffix1), 2);
    var a = new $ac_O(1);
    a.set(0, elem);
    var length0$80 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$76 = this.sci_Vector__f_prefix1;
    var len1$70 = this.sci_Vector6__f_len1;
    var prefix2$63 = this.sci_Vector6__f_prefix2;
    var len12$63 = this.sci_Vector6__f_len12;
    var prefix3$51 = this.sci_Vector6__f_prefix3;
    var len123$51 = this.sci_Vector6__f_len123;
    var prefix4$34 = this.sci_Vector6__f_prefix4;
    var len1234$34 = this.sci_Vector6__f_len1234;
    var prefix5$12 = this.sci_Vector6__f_prefix5;
    var len12345$12 = this.sci_Vector6__f_len12345;
    var data6$12 = this.sci_Vector6__f_data6;
    var suffix5$12 = this.sci_Vector6__f_suffix5;
    var suffix4$34 = this.sci_Vector6__f_suffix4;
    var suffix3$51 = this.sci_Vector6__f_suffix3;
    return new $c_sci_Vector6(prefix1$76, len1$70, prefix2$63, len12$63, prefix3$51, len123$51, prefix4$34, len1234$34, prefix5$12, len12345$12, data6$12, suffix5$12, suffix4$34, suffix3$51, suffix2$63, a, length0$80);
  } else if (($n(this.sci_Vector6__f_suffix3).u.length < 31)) {
    var suffix3$52 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix2, this.sci_BigVector__f_suffix1)), 3);
    var a$1 = new $ac_O(1);
    a$1.set(0, elem);
    var length0$81 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$77 = this.sci_Vector__f_prefix1;
    var len1$71 = this.sci_Vector6__f_len1;
    var prefix2$64 = this.sci_Vector6__f_prefix2;
    var len12$64 = this.sci_Vector6__f_len12;
    var prefix3$52 = this.sci_Vector6__f_prefix3;
    var len123$52 = this.sci_Vector6__f_len123;
    var prefix4$35 = this.sci_Vector6__f_prefix4;
    var len1234$35 = this.sci_Vector6__f_len1234;
    var prefix5$13 = this.sci_Vector6__f_prefix5;
    var len12345$13 = this.sci_Vector6__f_len12345;
    var data6$13 = this.sci_Vector6__f_data6;
    var suffix5$13 = this.sci_Vector6__f_suffix5;
    var suffix4$35 = this.sci_Vector6__f_suffix4;
    var suffix2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector6(prefix1$77, len1$71, prefix2$64, len12$64, prefix3$52, len123$52, prefix4$35, len1234$35, prefix5$13, len12345$13, data6$13, suffix5$13, suffix4$35, suffix3$52, suffix2, a$1, length0$81);
  } else if (($n(this.sci_Vector6__f_suffix4).u.length < 31)) {
    var suffix4$36 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix2, this.sci_BigVector__f_suffix1))), 4);
    var a$2 = new $ac_O(1);
    a$2.set(0, elem);
    var length0$82 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$78 = this.sci_Vector__f_prefix1;
    var len1$72 = this.sci_Vector6__f_len1;
    var prefix2$65 = this.sci_Vector6__f_prefix2;
    var len12$65 = this.sci_Vector6__f_len12;
    var prefix3$53 = this.sci_Vector6__f_prefix3;
    var len123$53 = this.sci_Vector6__f_len123;
    var prefix4$36 = this.sci_Vector6__f_prefix4;
    var len1234$36 = this.sci_Vector6__f_len1234;
    var prefix5$14 = this.sci_Vector6__f_prefix5;
    var len12345$14 = this.sci_Vector6__f_len12345;
    var data6$14 = this.sci_Vector6__f_data6;
    var suffix5$14 = this.sci_Vector6__f_suffix5;
    var suffix3 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var suffix2$1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector6(prefix1$78, len1$72, prefix2$65, len12$65, prefix3$53, len123$53, prefix4$36, len1234$36, prefix5$14, len12345$14, data6$14, suffix5$14, suffix4$36, suffix3, suffix2$1, a$2, length0$82);
  } else if (($n(this.sci_Vector6__f_suffix5).u.length < 31)) {
    var suffix5$15 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix5, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix2, this.sci_BigVector__f_suffix1)))), 5);
    var a$3 = new $ac_O(1);
    a$3.set(0, elem);
    var length0$83 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$79 = this.sci_Vector__f_prefix1;
    var len1$73 = this.sci_Vector6__f_len1;
    var prefix2$66 = this.sci_Vector6__f_prefix2;
    var len12$66 = this.sci_Vector6__f_len12;
    var prefix3$54 = this.sci_Vector6__f_prefix3;
    var len123$54 = this.sci_Vector6__f_len123;
    var prefix4$37 = this.sci_Vector6__f_prefix4;
    var len1234$37 = this.sci_Vector6__f_len1234;
    var prefix5$15 = this.sci_Vector6__f_prefix5;
    var len12345$15 = this.sci_Vector6__f_len12345;
    var data6$15 = this.sci_Vector6__f_data6;
    var suffix4 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty4;
    var suffix3$1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var suffix2$2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector6(prefix1$79, len1$73, prefix2$66, len12$66, prefix3$54, len123$54, prefix4$37, len1234$37, prefix5$15, len12345$15, data6$15, suffix5$15, suffix4, suffix3$1, suffix2$2, a$3, length0$83);
  } else if (($n(this.sci_Vector6__f_data6).u.length < 62)) {
    var data6$16 = $asArrayOf_O($m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_data6, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix5, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix4, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix3, $m_sci_VectorStatics$().copyAppend__AO__O__AO(this.sci_Vector6__f_suffix2, this.sci_BigVector__f_suffix1))))), 6);
    var a$4 = new $ac_O(1);
    a$4.set(0, elem);
    var length0$84 = ((1 + this.sci_BigVector__f_length0) | 0);
    var prefix1$80 = this.sci_Vector__f_prefix1;
    var len1$74 = this.sci_Vector6__f_len1;
    var prefix2$67 = this.sci_Vector6__f_prefix2;
    var len12$67 = this.sci_Vector6__f_len12;
    var prefix3$55 = this.sci_Vector6__f_prefix3;
    var len123$55 = this.sci_Vector6__f_len123;
    var prefix4$38 = this.sci_Vector6__f_prefix4;
    var len1234$38 = this.sci_Vector6__f_len1234;
    var prefix5$16 = this.sci_Vector6__f_prefix5;
    var len12345$16 = this.sci_Vector6__f_len12345;
    var suffix5 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty5;
    var suffix4$1 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty4;
    var suffix3$2 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty3;
    var suffix2$3 = $m_sci_VectorStatics$().sci_VectorStatics$__f_empty2;
    return new $c_sci_Vector6(prefix1$80, len1$74, prefix2$67, len12$67, prefix3$55, len123$55, prefix4$38, len1234$38, prefix5$16, len12345$16, data6$16, suffix5, suffix4$1, suffix3$2, suffix2$3, a$4, length0$84);
  } else {
    throw $ct_jl_IllegalArgumentException__(new $c_jl_IllegalArgumentException());
  }
});
$c_sci_Vector6.prototype.vectorSliceCount__I = (function() {
  return 11;
});
$c_sci_Vector6.prototype.vectorSlice__I__AO = (function(idx) {
  switch (idx) {
    case 0: {
      return this.sci_Vector__f_prefix1;
      break;
    }
    case 1: {
      return this.sci_Vector6__f_prefix2;
      break;
    }
    case 2: {
      return this.sci_Vector6__f_prefix3;
      break;
    }
    case 3: {
      return this.sci_Vector6__f_prefix4;
      break;
    }
    case 4: {
      return this.sci_Vector6__f_prefix5;
      break;
    }
    case 5: {
      return this.sci_Vector6__f_data6;
      break;
    }
    case 6: {
      return this.sci_Vector6__f_suffix5;
      break;
    }
    case 7: {
      return this.sci_Vector6__f_suffix4;
      break;
    }
    case 8: {
      return this.sci_Vector6__f_suffix3;
      break;
    }
    case 9: {
      return this.sci_Vector6__f_suffix2;
      break;
    }
    case 10: {
      return this.sci_BigVector__f_suffix1;
      break;
    }
    default: {
      throw new $c_s_MatchError(idx);
    }
  }
});
$c_sci_Vector6.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  if (((index >= 0) && (index < this.sci_BigVector__f_length0))) {
    var io = ((index - this.sci_Vector6__f_len12345) | 0);
    if ((io >= 0)) {
      var i6 = ((io >>> 25) | 0);
      var i5 = (31 & ((io >>> 20) | 0));
      var i4 = (31 & ((io >>> 15) | 0));
      var i3 = (31 & ((io >>> 10) | 0));
      var i2 = (31 & ((io >>> 5) | 0));
      var i1 = (31 & io);
      return ((i6 < $n(this.sci_Vector6__f_data6).u.length) ? $n($n($n($n($n($n(this.sci_Vector6__f_data6).get(i6)).get(i5)).get(i4)).get(i3)).get(i2)).get(i1) : ((i5 < $n(this.sci_Vector6__f_suffix5).u.length) ? $n($n($n($n($n(this.sci_Vector6__f_suffix5).get(i5)).get(i4)).get(i3)).get(i2)).get(i1) : ((i4 < $n(this.sci_Vector6__f_suffix4).u.length) ? $n($n($n($n(this.sci_Vector6__f_suffix4).get(i4)).get(i3)).get(i2)).get(i1) : ((i3 < $n(this.sci_Vector6__f_suffix3).u.length) ? $n($n($n(this.sci_Vector6__f_suffix3).get(i3)).get(i2)).get(i1) : ((i2 < $n(this.sci_Vector6__f_suffix2).u.length) ? $n($n(this.sci_Vector6__f_suffix2).get(i2)).get(i1) : $n(this.sci_BigVector__f_suffix1).get(i1))))));
    } else if ((index >= this.sci_Vector6__f_len1234)) {
      var io$2 = ((index - this.sci_Vector6__f_len1234) | 0);
      return $n($n($n($n($n(this.sci_Vector6__f_prefix5).get(((io$2 >>> 20) | 0))).get((31 & ((io$2 >>> 15) | 0)))).get((31 & ((io$2 >>> 10) | 0)))).get((31 & ((io$2 >>> 5) | 0)))).get((31 & io$2));
    } else if ((index >= this.sci_Vector6__f_len123)) {
      var io$3 = ((index - this.sci_Vector6__f_len123) | 0);
      return $n($n($n($n(this.sci_Vector6__f_prefix4).get(((io$3 >>> 15) | 0))).get((31 & ((io$3 >>> 10) | 0)))).get((31 & ((io$3 >>> 5) | 0)))).get((31 & io$3));
    } else if ((index >= this.sci_Vector6__f_len12)) {
      var io$4 = ((index - this.sci_Vector6__f_len12) | 0);
      return $n($n($n(this.sci_Vector6__f_prefix3).get(((io$4 >>> 10) | 0))).get((31 & ((io$4 >>> 5) | 0)))).get((31 & io$4));
    } else if ((index >= this.sci_Vector6__f_len1)) {
      var io$5 = ((index - this.sci_Vector6__f_len1) | 0);
      return $n($n(this.sci_Vector6__f_prefix2).get(((io$5 >>> 5) | 0))).get((31 & io$5));
    } else {
      return $n(this.sci_Vector__f_prefix1).get(index);
    }
  } else {
    throw $n(this.ioob__I__jl_IndexOutOfBoundsException(index));
  }
});
function $as_sci_Vector6(obj) {
  return (((obj instanceof $c_sci_Vector6) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector6"));
}
function $isArrayOf_sci_Vector6(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector6)));
}
function $asArrayOf_sci_Vector6(obj, depth) {
  return (($isArrayOf_sci_Vector6(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector6;", depth));
}
var $d_sci_Vector6 = new $TypeData().initClass($c_sci_Vector6, "scala.collection.immutable.Vector6", ({
  sci_Vector6: 1,
  sci_BigVector: 1,
  sci_VectorImpl: 1,
  sci_Vector: 1,
  sci_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  sci_Iterable: 1,
  sci_SeqOps: 1,
  sci_Seq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  sci_IndexedSeqOps: 1,
  sci_IndexedSeq: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  sci_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
function $ct_scm_StringBuilder__jl_StringBuilder__($thiz, underlying) {
  $thiz.scm_StringBuilder__f_underlying = underlying;
  return $thiz;
}
function $ct_scm_StringBuilder__($thiz) {
  $ct_scm_StringBuilder__jl_StringBuilder__($thiz, new $c_jl_StringBuilder());
  return $thiz;
}
/** @constructor */
function $c_scm_StringBuilder() {
  this.scm_StringBuilder__f_underlying = null;
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.addAll__sc_IterableOnce__scm_Growable = (function(elems) {
  return $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, elems);
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_IndexedSeqView$Id(this);
  return $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this$1);
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  var x = $n(this.scm_StringBuilder__f_underlying).length__I();
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_scm_StringBuilder.prototype.stringPrefix__T = (function() {
  return "IndexedSeq";
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  return $n(this.scm_StringBuilder__f_underlying).length__I();
});
$c_scm_StringBuilder.prototype.knownSize__I = (function() {
  return $n(this.scm_StringBuilder__f_underlying).length__I();
});
$c_scm_StringBuilder.prototype.addOne__C__scm_StringBuilder = (function(x) {
  var this$1 = $n(this.scm_StringBuilder__f_underlying);
  var str = ("" + $cToS(x));
  this$1.jl_StringBuilder__f_java$lang$StringBuilder$$content = (this$1.jl_StringBuilder__f_java$lang$StringBuilder$$content + str);
  return this;
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  return $n(this.scm_StringBuilder__f_underlying).jl_StringBuilder__f_java$lang$StringBuilder$$content;
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return ($n(this.scm_StringBuilder__f_underlying).length__I() === 0);
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(i) {
  return $bC($n(this.scm_StringBuilder__f_underlying).charAt__I__C(i));
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var i = $uI(v1);
  return $bC($n(this.scm_StringBuilder__f_underlying).charAt__I__C(i));
});
$c_scm_StringBuilder.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__C__scm_StringBuilder($uC(elem));
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  return $n(this.scm_StringBuilder__f_underlying).jl_StringBuilder__f_java$lang$StringBuilder$$content;
});
var $d_scm_StringBuilder = new $TypeData().initClass($c_scm_StringBuilder, "scala.collection.mutable.StringBuilder", ({
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  scm_Iterable: 1,
  jl_Cloneable: 1,
  scm_Cloneable: 1,
  scm_SeqOps: 1,
  scm_Seq: 1,
  scm_Clearable: 1,
  scm_Growable: 1,
  scm_Builder: 1,
  scm_ReusableBuilder: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  scm_IndexedSeqOps: 1,
  scm_IndexedSeq: 1,
  jl_CharSequence: 1,
  Ljava_io_Serializable: 1
}));
function $as_scm_LinkedHashMap(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.LinkedHashMap"));
}
function $isArrayOf_scm_LinkedHashMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_LinkedHashMap)));
}
function $asArrayOf_scm_LinkedHashMap(obj, depth) {
  return (($isArrayOf_scm_LinkedHashMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.LinkedHashMap;", depth));
}
function $as_scm_ListBuffer(obj) {
  return ((false || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"));
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)));
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth));
}
function $ct_scm_ArrayBuffer__AO__I__($thiz, initialElements, initialSize) {
  $thiz.scm_ArrayBuffer__f_mutationCount = 0;
  $thiz.scm_ArrayBuffer__f_array = initialElements;
  $thiz.scm_ArrayBuffer__f_size0 = initialSize;
  return $thiz;
}
function $ct_scm_ArrayBuffer__($thiz) {
  $ct_scm_ArrayBuffer__AO__I__($thiz, new $ac_O(16), 0);
  return $thiz;
}
function $p_scm_ArrayBuffer__reduceToSize__I__V($thiz, n) {
  $thiz.scm_ArrayBuffer__f_mutationCount = ((1 + $thiz.scm_ArrayBuffer__f_mutationCount) | 0);
  var a = $thiz.scm_ArrayBuffer__f_array;
  var toIndex = $thiz.scm_ArrayBuffer__f_size0;
  $m_ju_Arrays$().fill__AO__I__I__O__V(a, n, toIndex, null);
  $thiz.scm_ArrayBuffer__f_size0 = n;
}
/** @constructor */
function $c_scm_ArrayBuffer() {
  this.scm_ArrayBuffer__f_mutationCount = 0;
  this.scm_ArrayBuffer__f_array = null;
  this.scm_ArrayBuffer__f_size0 = 0;
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return $n(this.view__scm_ArrayBufferView()).iterator__sc_Iterator();
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  var x = this.scm_ArrayBuffer__f_size0;
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_scm_ArrayBuffer.prototype.knownSize__I = (function() {
  return this.scm_ArrayBuffer__f_size0;
});
$c_scm_ArrayBuffer.prototype.ensureSize__I__V = (function(n) {
  this.scm_ArrayBuffer__f_array = $m_scm_ArrayBuffer$().scala$collection$mutable$ArrayBuffer$$$ensureSize__AO__I__I__AO(this.scm_ArrayBuffer__f_array, this.scm_ArrayBuffer__f_size0, n);
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(n) {
  var hi = ((1 + n) | 0);
  if ((n < 0)) {
    throw $n($m_scg_CommonErrors$().indexOutOfBounds__I__I__jl_IndexOutOfBoundsException(n, ((this.scm_ArrayBuffer__f_size0 - 1) | 0)));
  }
  if ((hi > this.scm_ArrayBuffer__f_size0)) {
    throw $n($m_scg_CommonErrors$().indexOutOfBounds__I__I__jl_IndexOutOfBoundsException(((hi - 1) | 0), ((this.scm_ArrayBuffer__f_size0 - 1) | 0)));
  }
  return $n(this.scm_ArrayBuffer__f_array).get(n);
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.scm_ArrayBuffer__f_size0;
});
$c_scm_ArrayBuffer.prototype.view__scm_ArrayBufferView = (function() {
  return new $c_scm_ArrayBufferView(this, new $c_sr_AbstractFunction0_$$Lambda$07eded5776954a9c145e92c329afd52873ad179c((() => this.scm_ArrayBuffer__f_mutationCount)));
});
$c_scm_ArrayBuffer.prototype.addOne__O__scm_ArrayBuffer = (function(elem) {
  this.scm_ArrayBuffer__f_mutationCount = ((1 + this.scm_ArrayBuffer__f_mutationCount) | 0);
  var newSize = ((1 + this.scm_ArrayBuffer__f_size0) | 0);
  if (($n(this.scm_ArrayBuffer__f_array).u.length <= ((newSize - 1) | 0))) {
    this.ensureSize__I__V(newSize);
  }
  this.scm_ArrayBuffer__f_size0 = newSize;
  $n(this.scm_ArrayBuffer__f_array).set(((newSize - 1) | 0), elem);
  return this;
});
$c_scm_ArrayBuffer.prototype.addAll__sc_IterableOnce__scm_ArrayBuffer = (function(elems) {
  if ((elems instanceof $c_scm_ArrayBuffer)) {
    var elems$2 = $as_scm_ArrayBuffer(elems);
    var elemsLength = $n(elems$2).scm_ArrayBuffer__f_size0;
    if ((elemsLength > 0)) {
      this.scm_ArrayBuffer__f_mutationCount = ((1 + this.scm_ArrayBuffer__f_mutationCount) | 0);
      this.ensureSize__I__V(((this.scm_ArrayBuffer__f_size0 + elemsLength) | 0));
      $m_s_Array$().copy__O__I__O__I__I__V($n(elems$2).scm_ArrayBuffer__f_array, 0, this.scm_ArrayBuffer__f_array, this.scm_ArrayBuffer__f_size0, elemsLength);
      this.scm_ArrayBuffer__f_size0 = ((this.scm_ArrayBuffer__f_size0 + elemsLength) | 0);
    }
  } else {
    $f_scm_Growable__addAll__sc_IterableOnce__scm_Growable(this, elems);
  }
  return this;
});
$c_scm_ArrayBuffer.prototype.remove__I__O = (function(index) {
  var hi = ((1 + index) | 0);
  if ((index < 0)) {
    throw $n($m_scg_CommonErrors$().indexOutOfBounds__I__I__jl_IndexOutOfBoundsException(index, ((this.scm_ArrayBuffer__f_size0 - 1) | 0)));
  }
  if ((hi > this.scm_ArrayBuffer__f_size0)) {
    throw $n($m_scg_CommonErrors$().indexOutOfBounds__I__I__jl_IndexOutOfBoundsException(((hi - 1) | 0), ((this.scm_ArrayBuffer__f_size0 - 1) | 0)));
  }
  var res = this.apply__I__O(index);
  $m_s_Array$().copy__O__I__O__I__I__V(this.scm_ArrayBuffer__f_array, ((1 + index) | 0), this.scm_ArrayBuffer__f_array, index, ((this.scm_ArrayBuffer__f_size0 - ((1 + index) | 0)) | 0));
  $p_scm_ArrayBuffer__reduceToSize__I__V(this, ((this.scm_ArrayBuffer__f_size0 - 1) | 0));
  return res;
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer";
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__I = (function(xs, start, len) {
  var srcLen = this.scm_ArrayBuffer__f_size0;
  var destLen = $m_jl_reflect_Array$().getLength__O__I(xs);
  var limit = ((len < srcLen) ? len : srcLen);
  var capacity = ((start < 0) ? destLen : ((destLen - start) | 0));
  var total = ((capacity < limit) ? capacity : limit);
  var copied = ((total < 0) ? 0 : total);
  if ((copied > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V(this.scm_ArrayBuffer__f_array, 0, xs, start, copied);
  }
  return copied;
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1));
});
$c_scm_ArrayBuffer.prototype.addOne__O__scm_Growable = (function(elem) {
  return this.addOne__O__scm_ArrayBuffer(elem);
});
$c_scm_ArrayBuffer.prototype.addAll__sc_IterableOnce__scm_Growable = (function(elems) {
  return this.addAll__sc_IterableOnce__scm_ArrayBuffer(elems);
});
function $as_scm_ArrayBuffer(obj) {
  return (((obj instanceof $c_scm_ArrayBuffer) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"));
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)));
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth));
}
var $d_scm_ArrayBuffer = new $TypeData().initClass($c_scm_ArrayBuffer, "scala.collection.mutable.ArrayBuffer", ({
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  scm_Iterable: 1,
  jl_Cloneable: 1,
  scm_Cloneable: 1,
  scm_SeqOps: 1,
  scm_Seq: 1,
  scm_Clearable: 1,
  scm_Growable: 1,
  scm_Shrinkable: 1,
  scm_Buffer: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  scm_IndexedSeqOps: 1,
  scm_IndexedSeq: 1,
  scm_IndexedBuffer: 1,
  sc_StrictOptimizedIterableOps: 1,
  sc_StrictOptimizedSeqOps: 1,
  Ljava_io_Serializable: 1,
  scg_DefaultSerializable: 1
}));
function $ct_sjs_js_WrappedArray__sjs_js_Array__($thiz, array) {
  $thiz.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array = array;
  return $thiz;
}
function $ct_sjs_js_WrappedArray__($thiz) {
  $ct_sjs_js_WrappedArray__sjs_js_Array__($thiz, []);
  return $thiz;
}
/** @constructor */
function $c_sjs_js_WrappedArray() {
  this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array = null;
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "IndexedSeq";
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  var this$1 = new $c_sc_IndexedSeqView$Id(this);
  return $ct_sc_IndexedSeqView$IndexedSeqViewIterator__sc_IndexedSeqView__(new $c_sc_IndexedSeqView$IndexedSeqViewIterator(), this$1);
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  var x = $uI(this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array.length);
  return ((x === len) ? 0 : ((x < len) ? (-1) : 1));
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array[index];
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array.length);
});
$c_sjs_js_WrappedArray.prototype.knownSize__I = (function() {
  return $uI(this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array.length);
});
$c_sjs_js_WrappedArray.prototype.className__T = (function() {
  return "WrappedArray";
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this;
});
$c_sjs_js_WrappedArray.prototype.addOne__O__scm_Growable = (function(elem) {
  this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array.push(elem);
  return this;
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.sjs_js_WrappedArray__f_scala$scalajs$js$WrappedArray$$array[index];
});
function $as_sjs_js_WrappedArray(obj) {
  return (((obj instanceof $c_sjs_js_WrappedArray) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.WrappedArray"));
}
function $isArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_WrappedArray)));
}
function $asArrayOf_sjs_js_WrappedArray(obj, depth) {
  return (($isArrayOf_sjs_js_WrappedArray(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.WrappedArray;", depth));
}
var $d_sjs_js_WrappedArray = new $TypeData().initClass($c_sjs_js_WrappedArray, "scala.scalajs.js.WrappedArray", ({
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_IterableOnce: 1,
  sc_IterableOnceOps: 1,
  sc_IterableOps: 1,
  sc_IterableFactoryDefaults: 1,
  sc_Iterable: 1,
  F1: 1,
  s_PartialFunction: 1,
  sc_SeqOps: 1,
  s_Equals: 1,
  sc_Seq: 1,
  scm_Iterable: 1,
  jl_Cloneable: 1,
  scm_Cloneable: 1,
  scm_SeqOps: 1,
  scm_Seq: 1,
  scm_Clearable: 1,
  scm_Growable: 1,
  scm_Shrinkable: 1,
  scm_Buffer: 1,
  sc_StrictOptimizedSeqOps: 1,
  sc_StrictOptimizedIterableOps: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeqOps: 1,
  sc_IndexedSeq: 1,
  scm_IndexedSeqOps: 1,
  scm_IndexedBuffer: 1,
  scm_Builder: 1,
  Ljava_io_Serializable: 1
}));
$s_LMain__main__AT__V(new ($d_T.getArrayOf().constr)([]));
}).call(this);
