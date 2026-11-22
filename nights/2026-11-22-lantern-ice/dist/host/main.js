// Boot: build the scene, the painter, the sound and the bridge, then let the
// game in src/game.v (compiled to JS) drive the picture from its own rules.
(function () {
  const { createScene, createBridge } = window.LakeBridge;
  const { createPainter } = window.LakePaint;
  const { createSound } = window.LakeSound;
  const { attachControls } = window.LakeControls;

  const canvas = document.getElementById('bay');
  const scene = createScene();
  const painter = createPainter(canvas, scene);
  const sound = createSound();
  const bridge = createBridge(scene, painter, sound);
  const controls = attachControls(scene, bridge.game, sound, painter);
  Object.assign(window, bridge.hooks);
  window.__lake = { scene, painter, bridge, controls, sound };
  painter.resize();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!document.hidden) {
      bridge.game.frame(dt);
      bridge.tick(dt);
      painter.draw(scene.t, dt);
      controls.refresh(false);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => painter.resize());
  window.addEventListener('orientationchange', () => painter.resize());
  bridge.game.boot(); // main__boot: the first level, the first hint
  requestAnimationFrame(loop);
})();
