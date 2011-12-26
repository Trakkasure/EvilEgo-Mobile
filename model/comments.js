CommentModel = Backbone.Model.extend({
    defaults: {
        post_id: null
      , message: 'This is an empty post'
    }
  , initialize: function(defaults) {
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
        _.bindAll(this,'url')
    } 
  , url: function() {
      return EvilEgo.dataHost+'/post/'+this.get('_id')
    }
})

CommentCollection = Backbone.Collection.extend({
    model: CommentModel
  , initialize: function(params) {
        var now = (new Date()).getTime()
        this.post_id = params.post_id
        this.comparator = function(item) {
            var x = parseInt(item.get('timestamp'))
            return (now - x)
        }
        _.bindAll(this,'fetchComments', 'url')
    }
  , fetchComments: function(player) {
        //console.log('Fetching posts for '+player)
        var self = this
        this.trigger('loading')
        this.fetch({success: function(){self.trigger('load_done')},error: function(err) {self.trigger('load_error')}})
        return this
    }
  , url: function() {
        return EvilEgo.dataHost+'/post/'+this.post_id+'/comment'
    }
})

CommentFormModel = Backbone.Model.extend({
    url: function() { // used for saving the model to the server.
        console.log(EvilEgo.dataHost+'/post/'+this.get('post_id')+'/comment'+(this.get('id')?'/'+this.get('id'):''))
        return EvilEgo.dataHost+'/post/'+this.get('post_id')+'/comment'+(this.get('id')?'/'+this.get('id'):'')
    }
  , initialize: function(defaults) {
        _.bindAll(this,'url')
        this.set(defaults)
    }
})
