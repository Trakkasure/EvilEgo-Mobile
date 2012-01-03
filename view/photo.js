ImageView = Backbone.View.extend({
    el: $('#photo')
  , events: {
        'swipeleft'         : 'next'
//    , 'click #next-photo' : 'next'
//    , 'click #prev-photo' : 'prev'
      , 'swiperight'        : 'prev'
//    , 'click #back-photo' : 'back'
    }
  , initialize: function(post,index) {
        _.bindAll(this,'render','next','prev','back')
        this.post = post
        this.imageIndex = Math.max(index||0,0)
        setTimeout(this.render,500)
    }
  , render: function() {
        var img = this.post.get('images')[this.imageIndex]
        $('.content', this.el).empty()
        $('.content', this.el).append('<img src="http://evilego.com/uploads/th_'+img+'" onload="this.src=\'http://evilego.com/uploads/'+img+'\'" />')
        $('.photocount',this.el).html((this.imageIndex+1)+' of '+this.post.get('images').length)
    /*
        if (this.imageIndex >= this.post.get('images').length-1)
            $('#next-photo',this.el).hide()
        else
            $('#next-photo',this.el).show()
        if (this.imageIndex <= 0)
            $('#prev-photo',this.el).hide()
        else
            $('#prev-photo',this.el).show()
        return this
        */
    }
  , next: function() {
        if (this.imageIndex >= this.post.get('images').length-1) return this.back()
        this.imageIndex++
        return this.render()
    }
  , prev: function() {
        if (this.imageIndex <= 0) return this.back()
        this.imageIndex--
        return this.render()
    }
  , back: function() {
        window.location.hash = "newsfeed"
    }
})
