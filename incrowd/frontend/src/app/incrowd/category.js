angular.module('incrowdLib')
  .service('Categories', function (BACKEND_SERVER, djResource) {
    var Category = {};
      Category.resource = djResource(BACKEND_SERVER + 'categories/', {
    });
    Category.categories = Category.resource.query();
    return Category;

  });
