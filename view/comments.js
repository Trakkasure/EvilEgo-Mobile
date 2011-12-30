CommentView = Backbone.View.extend({
    tagName: 'li'
  , disableMouseEvents: false
  , menuOn: false
  , events: {
        'click'              : 'clickedContent'
      , 'click #profile'     : 'showProfile'
    }
  , initialize: function() {
      _.bindAll(this,'render','clickedContent','showProfile','swiperight')
      this.template = '#commentTemplate'
    }
  , clickedContent: function(e) {
        e.stopPropagation()
        e.preventDefault()
        // do nothing right now.
    }
  , showProfile: function() {
        e.stopPropagation()
        e.preventDefault()
        // do nothing right now.
    }
  , swiperight: function() {
    }
  , render: function() {
      $(this.el).html($.tmpl($(this.template).html(),this.model.toJSON()))
      $(this.el).attr('id',this.model.get('_id'))
      return this
    }
})
getTemplate('templates/commentList.html','commentListTemplate')
getTemplate('templates/comment.html','commentTemplate')

// This is the container for the list of posts
CommentListView = Backbone.View.extend({
    el: $('#comments')
  , events: {
        'click #new-comment-button': 'newComment'
      , 'swiperight'         : 'swiperight'
      , 'swipeleft'          : 'swipeleft'
    }
  , template: '#commentListTemplate'
  , initialize: function(collection) {
        _.bindAll(this, 'render', 'swiperight', 'swipeleft', 'appendComment', 'newComment') // remember: every function that uses 'this' as the current object should be in here
        EvilEgo.collections.CommentCollection = collection
        if (collection) {
            this.collection = collection
            this.collection.bind('add', this.render) // collection event binder
            this.collection.bind('reset',this.render)
        }
    }
  , swiperight: function(e) { // go back to newsfeed
        e.stopPropagation()
        e.preventDefault()
        window.location.hash = 'newsfeed'
    }
  , swipeleft: function(e) { // go back to newsfeed
        e.stopPropagation()
        e.preventDefault()
        this.newComment()
    }
  , appendComment: function(comment,collection) {
        if (!collection && this.collection.models.indexOf(comment)==-1) {
            //console.log('Post not in collection. Adding...')
            this.collection.add(comment) // we weren't called by an event
        } else {
            if (comment.collection && (comment.collection != this.collection)) {
                //console.log('removing comment from different post')
                comment.collection.remove(comment)
            }
            comment.collection = this.collection
            $('ul', this.el).append((new CommentView({model:comment})).render().el)
        }
        return this
    }
  , newComment: function() {
        new CommentFormView({model: new CommentFormModel({player: EvilEgo.currentLogin, post_id: this.collection.post_id})})
        window.location.hash = 'new-comment'
    }
  , render: function() {
        $('#comments-container',this.el).html($.tmpl($(this.template).html(),{}))
        _(this.collection.models).each(function(post){ // iterate the post models
            this.appendComment(post,this.collection) // append the models
        },this)
        $(this.el).trigger('create')
        return this
    }
})

getTemplate('templates/commentForm.html','commentFormTemplate')
CommentFormView = Backbone.View.extend({
    el: $('#new-comment')
  , events: {
        'click #save-comment'             : 'submitComment'
      , 'change textarea[name="comment"]' : 'updateCommentText'
    }
  , template: '#commentFormTemplate'
  , initialize: function() {
        //console.log('New comment form view')
        _.bindAll(this, 'render', 'submitComment', 'updateCommentText') // remember: every function that uses 'this' as the current object should be in here
        //this.model.bind('change',this.render)
        var self = this
        //console.log('fetching')
        //this.model.fetch().done(function(){self.render()})
        this.render()
    }
  , render: function() {
        //console.log('Rendering comment form')
        try {
            $('#new-comment-container',this.el).html($.tmpl($(this.template).html(),this.model.toJSON()||{})).trigger('create')
        } catch (e) {
            console.log(e.description)
        }
        return this
    }
  , submitComment: function() {
        this.model.save().done(function(data) {
            //console.log('Comment saved')
            data.prettyDate = "just now"
            EvilEgo.collections.CommentCollection.add(data)
            window.location.hash = 'comments'
        }).error(function(data) {
            if (navigator.notification)
                navigator.notification.alert('Could not save comment.\n')
            else
                alert('Could not save comment.\n'+data||'')
        })
    }
  , updateCommentText: function(e) {
        this.model.set({comment: e.currentTarget.value})
    }
})
