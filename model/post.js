PostModel = Backbone.Model.extend({
    defaults: {
        '_id': '-'
      , title: 'Default Title'
      , owner: 'Nobody'
      , post:  'This is an empty post'
      , isEmpty: true
    }
  , initialize: function(defaults) {
        console.log("init model: user")
        if (defaults && 'object' === typeof(defaults))
            this.set(defaults)
    }
  , addPoint: function() {
    }
  , removePoint: function() {
    }
  , url: function() {
      return '/post/'+this.get('_id')
    }
})

PostCollection = Backbone.Collection.extend({
    type: ''
  , model: PostModel

  , initialize: function(args) {
      this.type = args.type
    }
  , fetchPosts: function(option) {
        switch(this.type) {
            case 'newsfeed':
                this.url='/newsfeed/'+option||EvilEgo.loggedInUser.get('login')
                this.fetch()
            break
        }
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

