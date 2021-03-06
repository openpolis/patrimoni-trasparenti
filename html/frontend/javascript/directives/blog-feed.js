angular.module("PatrimoniTrasparenti")
  .directive('blogFeed', ["$timeout", function ($timeout) {
    return {
      restrict: 'E',
      templateUrl: "templates/directives/blog-feed.html",
      scope: {},
      link: function(scope, element, attributes) {
        //console.log('fetching blog feed...');
        $.get('http://blog.openpolis.it/categorie/campagne/patrimonitrasparenti/feed/', function(data) {
            $timeout(function(){
              scope.articles = [];
              var i = 0;
              var $xml = $(data);
              $xml.find("item").each(function() {
                  var $this = $(this),
                      item = {
                          title: $this.find("title").text(),
                          link: $this.find("link").text(),
                          // not my coding style, js forces me to do this, sorry :(
                          description: $($this.find('content\\:encoded').text()).text().split('\n')[0],
                          pubDate: new Date($this.find("pubDate").text()),
                          author: $this.find("author").text()
                  }
                  // Do something with item here...
                  // Only display last 3 articles.
                  if (i < 3) {
                    i++;
                    //console.log(item);
                    scope.articles.push(item);
                  };
              });
            });
        });
      }
    };
}])
