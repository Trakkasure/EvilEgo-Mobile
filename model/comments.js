CommentModel = Backbone.Model.extend({
    defaults: {
        post_id: null
      , message: 'This is an empty post'
    }
  , initialize: function(defaults) {
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
        _.bindAll(this,'url','remove')
        // Used in the template to show/hide the point voting section
        if (this.get('player'))
            this.set({
                canDelete: (this.get('player').toLowerCase() == EvilEgo.currentUser.toLowerCase())
            })
    } 
  , remove: function() {
        console.log(this.get('canDelete'))
        if (this.get('canDelete'))
            return this.destroy()
        else {
            console.log('Cannot delete')
            var d = $.Deferred()
            d.fail()
            return d
        }
    }
  , url: function() {
      return EvilEgo.dataHost+'/post/'+this.get('post_id')+'/'+this.get('_id')
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
  , fetchComments: function(page) {
        var self = this
        console.log('Fetching comments for '+this.post_id)
        //self.reset([],{silent:true}) // clear the contents and throw events.
        if (navigator.notificationEx)
            navigator.notificationEx.loadingStart({labelText:'Getting comments...'})
        var d = this.fetch({data:{page:page||0}}).done(function() {
            console.log('Done loading comments')
            clearTimeout(self.fetchTimer)
            self.fetchTimer = null
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        }).error(function(e) {
            console.log('Fail loading comments')
            if (navigator.notificationEx)
                navigator.notificationEx.loadingStop()
        })
        this.fetchTimer = setTimeout(d.fail,30000)
        return d
    }
  , url: function() {
        return EvilEgo.dataHost+'/post/'+this.post_id+'/comment'
    }
})

CommentFormModel = Backbone.Model.extend({
    url: function() { // used for saving the model to the server.
        return EvilEgo.dataHost+'/post/'+this.get('post_id')+'/comment'+(this.get('id')?'/'+this.get('id'):'')
    }
  , initialize: function(defaults) {
        _.bindAll(this,'url')
        this.set(defaults)
    }
})
