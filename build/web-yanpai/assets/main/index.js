System.register("chunks:///_virtual/main",["./woyaoyanpai.ts"],(function(){return{setters:[null],execute:function(){}}}));

System.register("chunks:///_virtual/woyaoyanpai.ts",["./rollupPluginModLoBabelHelpers.js","cc"],(function(t){var r,i,o,e,n,s,a,h,c,u,_,l,T,p,f;return{setters:[function(t){r=t.applyDecoratedDescriptor,i=t.inheritsLoose,o=t.createForOfIteratorHelperLoose,e=t.initializerDefineProperty,n=t.assertThisInitialized},function(t){s=t.cclegacy,a=t._decorator,h=t.Sprite,c=t.UITransform,u=t.v4,_=t.Node,l=t.v2,T=t.v3,p=t.Vec2,f=t.Component}],execute:function(){var g,m,y,d,P;s._RF.push({},"f4b4e6qj0hBFbY+ucKSxdAD","woyaoyanpai",void 0);var v=a.ccclass,C=a.property;t("woyaoyanpai",(g=v("woyaoyanpai"),m=C({type:h,tooltip:"需要被掀角的扑克牌 Sprite 组件"}),g((P=r((d=function(t){function r(){for(var r,i=arguments.length,o=new Array(i),s=0;s<i;s++)o[s]=arguments[s];return r=t.call.apply(t,[this].concat(o))||this,e(r,"cardSprite",P,n(r)),r._material=null,r._uiTransform=null,r._corners=[l(0,0),l(1,0),l(0,1),l(1,1)],r._currentCorner=null,r._targetTouchPos=l(0,0),r._currentTouchPos=l(0,0),r._isDragging=!1,r}i(r,t);var s=r.prototype;return s.onLoad=function(){if(this.cardSprite&&(this._uiTransform=this.cardSprite.getComponent(c),this._material=this.cardSprite.getMaterialInstance(0),this._material&&this._uiTransform)){this._material.setProperty("paddingData",u(200,400,this._uiTransform.width,this._uiTransform.height))}},s.start=function(){this.node.on(_.EventType.TOUCH_START,this.onTouchStart,this),this.node.on(_.EventType.TOUCH_MOVE,this.onTouchMove,this),this.node.on(_.EventType.TOUCH_END,this.onTouchEnd,this),this.node.on(_.EventType.TOUCH_CANCEL,this.onTouchEnd,this)},s._getLocalUV=function(t){if(!this._uiTransform)return l(.5,.5);var r=t.getUILocation(),i=this._uiTransform.convertToNodeSpaceAR(T(r.x,r.y,0)),o=this._uiTransform.width,e=this._uiTransform.height,n=this._uiTransform.anchorX,s=this._uiTransform.anchorY,a=(i.x+o*n)/o,h=1-(i.y+e*s)/e;return a=Math.max(0,Math.min(1,a)),h=Math.max(0,Math.min(1,h)),l(a,h)},s.onTouchStart=function(t){if(this._material){for(var r,i=this._getLocalUV(t),e=Number.MAX_VALUE,n=this._corners[0],s=o(this._corners);!(r=s()).done;){var a=r.value,h=p.distance(i,a);h<e&&(e=h,n=a)}this._currentCorner=n,this._isDragging=!0,this._currentTouchPos.set(i),this._targetTouchPos.set(i),this._material.setProperty("cornerPos",this._currentCorner),this._material.setProperty("touchPos",this._currentTouchPos)}},s.onTouchMove=function(t){if(this._material&&this._currentCorner){var r=this._getLocalUV(t);this._targetTouchPos.set(r)}},s.onTouchEnd=function(t){this._material&&this._currentCorner&&(this._isDragging=!1,this._targetTouchPos.set(this._currentCorner))},s.update=function(t){if(this._material&&this._currentCorner){var r=Math.min(t,.1),i=this._isDragging?25:15;this._currentTouchPos.x+=(this._targetTouchPos.x-this._currentTouchPos.x)*i*r,this._currentTouchPos.y+=(this._targetTouchPos.y-this._currentTouchPos.y)*i*r,this._material.setProperty("touchPos",this._currentTouchPos),!this._isDragging&&p.distance(this._currentTouchPos,this._currentCorner)<.005&&(this._currentTouchPos.set(this._currentCorner),this._material.setProperty("touchPos",this._currentTouchPos),this._currentCorner=null)}},r}(f)).prototype,"cardSprite",[m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),y=d))||y));s._RF.pop()}}}));

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});