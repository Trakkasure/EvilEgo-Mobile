console.log('view/player.js')

PlayerView = Backbone.View.extend({
    tagName: 'div'

  , initialize: function(defaults) {
        if (defaults) this.set(defaults)
    }
})

