# The words around the canvas: shelf name, progress, the hint line and the
# small card that appears when a shelf is kept.
class Hud
  def initialize(doc, session, audio, &on_advance)
    @doc = doc
    @session = session
    @audio = audio
    @on_advance = on_advance
    @el = {}
    %w[title progress hint card card-title card-text card-button sound undo restart shelf].each do |id|
      @el[id] = doc.call(:getElementById, id.to_js)
    end
    @shown = {}
    bind
  end

  def bind
    on(@el["sound"]) { @audio.on? ? @audio.disable : @audio.enable }
    on(@el["undo"]) { @session.undo }
    on(@el["restart"]) { @session.restart }
    on(@el["card-button"]) { @on_advance.call }
  end

  def refresh
    set("progress", "Shelf #{@session.level_index + 1} of #{Levels.count} · " \
                    "#{@session.settled_count} of #{@session.goal} settled")
    set("hint", @session.hint)
    set("sound", @audio.on? ? "Sound: on" : "Sound: off")
    set("shelf", @session.name)
  end

  def show_kept_card
    last = @session.level_index + 1 >= Levels.count
    set("card-title", last ? "The pantry is full" : "Shelf kept")
    set("card-text", last ? "Every jar is home. Stay as long as you like." : line)
    set("card-button", last ? "Open it again" : "Next shelf")
    open
  end

  def hide_card
    @el["card"][:style][:display] = "none".to_js
    @shown["card"] = false
  end

  private

  def line
    moves = @session.moves_taken
    return "Kept in #{moves} moves, with nothing taken back." if @session.clean?
    "Kept in #{moves} moves. The jars forgave the second thoughts."
  end

  def open
    @el["card"].call(:removeAttribute, "hidden".to_js)
    @el["card"][:style][:display] = "block".to_js
    @el["card-title"][:textContent] = @shown["card-title"].to_js
    @el["card-button"].call(:focus)
  end

  def on(el, &block)
    el.call(:addEventListener, "click".to_js, lambda { |_event|
      block.call
      nil
    })
  end

  def set(key, value)
    return if @shown[key] == value
    @shown[key] = value
    @el[key][:textContent] = value.to_js
  end
end
