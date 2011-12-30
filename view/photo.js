ImageView = Backbone.View.extend({
    el: $('#photo')
  , events: {
        'click #next-photo' : 'next'
      , 'swipeleft'         : 'next'
      , 'click #prev-photo' : 'prev'
      , 'swiperight'        : 'prev'
      , 'click #back-photo' : 'back'
    }
  , initialize: function(post,index) {
        _.bindAll(this,'render','next','prev','back')
        this.post = post
        this.imageIndex = Math.max(index||-1,0)
        this.render()
        //console.log('Image(%s): %s',this.imageIndex,JSON.stringify(this.post.toJSON().images))
    }
  , render: function() {
        $('.ui-content img',this.el).attr('src','http://evilego.com/uploads/'+this.post.get('images')[this.imageIndex])
        return this
    }
  , next: function() {
        if (this.imageIndex >= this.post.get('images').length-1) return
        $('.ui-content img',this.el).attr('src','http://evilego.com/uploads/'+this.post.get('images')[++this.imageIndex])
        return this
    }
  , prev: function() {
        if (this.imageIndex <= 0) return
        $('.ui-content img',this.el).attr('src','http://evilego.com/uploads/'+this.post.get('images')[--this.imageIndex])
        return this
    }
  , back: function() {
        window.location.hash = "newsfeed"
        return this
    }
  /*
    $('.photoview')
        .live('pagebeforehide',function(){
            $.fixedToolbars.hide(true);
        })
        .live('pageshow',function(){
            $.fixedToolbars.show();
        })
        .live('swipeleft',function(){
            $(this).find('a.next').click();
        })
        .live('swiperight',function(){
            $(this).next().find('a.prev').click();
        });

        $('.photoview img').live('mousedown touchstart',function(event){
            event.preventDefault();
        })    
*/
})
