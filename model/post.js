console.log('model/post.js')
PostModel = Backbone.Model.extend({
    defaults: {
        title: 'Default Title'
      , owner: 'Nobody'
      , post:  'This is an empty post'
      , isEmpty: true
    }
  , initialize: function(defaults) {
        //console.log("init model: post")
        //console.log(defaults)
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
    }
  , addPoint: function() {
        $.get('/post/'+this.get('_id')+'/vote/1').done(function(data){
            var points = data.points
            this.set({points:points})
        })
    }
  , removePoint: function() {
        $.get('/post/'+this.get('_id')+'/vote/-1').done(function(data){
            var points = data.points
            this.set({points:points})
        })
    }
  , url: function() {
      return '/post/'+this.get('owner')+'/'+this.get('_id')
    }
})

PostCollection = Backbone.Collection.extend({
    type: 'newsfeed'
  , model: PostModel

  , initialize: function() {
    }
  , setType: function(type) {
        this.type = type
    }
  , fetchPosts: function(player) {
        console.log('Fetching posts for '+player)
        var self = this
        switch(this.type) {
            case 'newsfeed':
                this.url = EvilEgo.dataHost+'/user/'+(player||EvilEgo.loggedInUser.get('login'))+'/newsfeed'
                this.trigger('loading')
                this.fetch({success: function(){self.trigger('load_done')},error: function(err) {self.trigger('load_error')}})
            break
        }
        return this
    }
})

CommentModel = Backbone.Model.extend({
    defaults: {
        owner: 'Nobody'
      , comment: 'Empty Comment'
    }
})

CommentCollection = Backbone.Collection.extend({
    model: CommentModel
})


PostFormModel = Backbone.Model.extend({
    defaults: {
        owner:'Nobody'
      , missions: []
    }
  , url: function() {
        return EvilEgo.dataHost+'/post/'+this.get('owner')+'/new'
    }
  , initialize: function(defaults) {
        this.set(defaults)
    }
})
