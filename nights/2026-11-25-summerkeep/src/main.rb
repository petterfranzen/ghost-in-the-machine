# Boot: build the pantry, wire the page and keep the frames coming.
module Main
  def self.start
    doc = JS.global[:document]
    canvas = doc.call(:getElementById, "scene".to_js)
    session = Session.new
    view = View.new(canvas)
    audio = Audio.new
    input = Input.new(canvas, view, session) { |move| nudge(view, audio, move) }
    hud = Hud.new(doc, session, audio) { advance(session, hud, audio) }
    listen(doc, view, audio)
    JS.global[:__summerkeep] = "ready".to_js
    frame(session, view, audio, input, hud)
  end

  def self.nudge(view, audio, move)
    return if move.nil?
    view.notify([:hint, move])
    audio.play([:hint])
  end

  def self.advance(session, hud, audio)
    audio.play([:kept_open])
    session.finished? ? session.begin_again : session.next_level
    hud.hide_card
  end

  def self.listen(doc, view, audio)
    JS.global.call(:addEventListener, "resize".to_js, ->(_e) { view.resize; nil })
    doc.call(:addEventListener, "visibilitychange".to_js, lambda { |_event|
      audio.resume unless doc[:hidden].to_s == "true"
      nil
    })
  end

  # One frame: events out, sound and pictures in, words refreshed. A frame that
  # trips over itself records the reason and the next one still arrives.
  def self.frame(session, view, audio, input, hud)
    @last = 0.0
    @progress = -1.0
    step = nil
    step = lambda do |stamp|
      begin
        tick(session, view, audio, input, hud, stamp.to_f / 1000.0)
      rescue StandardError => error
        JS.global[:__frameError] = error.message.to_js
      end
      JS.global.call(:requestAnimationFrame, step)
    end
    JS.global.call(:requestAnimationFrame, step)
  end

  def self.tick(session, view, audio, input, hud, now)
    dt = step_time(now)
    input.tick(dt)
    audio.unlock_if_wanted
    session.tick(dt)
    session.drain_events.each do |event|
      view.notify(event)
      audio.play(event)
      hud.show_kept_card if event[0] == :kept
    end
    quiet(audio, session)
    view.draw(session, dt, input.pointer)
    hud.refresh
  end

  def self.step_time(now)
    dt = @last.zero? ? 0.016 : [(now - @last), 0.05].min
    @last = now
    dt
  end

  def self.quiet(audio, session)
    level = session.settled_count.to_f / [session.goal, 1].max
    return if (level - @progress).abs < 0.001
    @progress = level
    audio.set_progress(level)
  end

end
