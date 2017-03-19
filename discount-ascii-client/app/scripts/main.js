(() => {


  $('#products-table').jscroll({
    loadingHtml: '<img src="loading.gif" alt="Loading" /> Loading...',
    padding: 20,
    nextSelector: 'a.jscroll-next:last',
    contentSelector: 'li'
  });

  const formatPriceAsDollars = (inputPrice) =>{
    return '$' + inputPrice + '.00';
  };

  var previousAdsUsed = [];

  const randomNumberGenerator = () => {
    const adID = Math.floor(Math.random()*1000);
    // TODO - if this ad exists - is in the above list then re-generate it
    return Math.floor(Math.random()*1000);
  };

  const insertAdvertisement = () => {
    $('#products-table tbody tr:nth-child(2n)').after('<img class="ad" src="/ad/?r=' + randomNumberGenerator() + '"/>' );
  };

  let loadProductsFromAPI = () => {

    $.ajax({
      type: 'GET',
      url: '/api/products',
      dataType: 'text',
      success: function(resultData) {
        var jsonString = '[' + resultData.replace(/\n/g, ',').slice(0, -1) + ']';
        console.log($.parseJSON(jsonString));

        var productJSON = $.parseJSON(jsonString);
        // Draw GoogleTable
        google.charts.load('current', {'packages':['table']});
        google.charts.setOnLoadCallback(drawTable);

        const drawTable = () => {
          const data = new google.visualization.DataTable(
            {
              cols: [
                {id: 'face', label: 'Face', type: 'string'},
                {id: 'price', label: 'Price', type: 'string'},
                {id: 'size', label: 'Size', type: 'number'},
                {id: 'date', label: 'Date', type: 'date'},
                {id: 'id', label: 'Product ID', type: 'string'}
              ]
            }
          );

          const formatDate = (productJSON) => {
            let formattedDate;
             // TODO - do a date check  here maybe to insert a f value for e.g. X days ago
              if(1 === 1){
                formattedDate = {v: new Date(productJSON[i]['date']),f: 'January First, Nineteen ninety-nine'};
              }else{
                formattedDate= productJSON[i]['date'];
              }
            return formattedDate;

          };

            for(var i = 0; i < productJSON.length; i++){
              data.addRow([ productJSON[i]['face'] ,  formatPriceAsDollars(productJSON[i]['price']) , productJSON[i]['size'] , formatDate(productJSON) , productJSON[i]['id'] ]);
              // TODO if the row count is 20 we need to insert an advertisement
            }

          if(productJSON.length >= 20){
            // need to show and ad after every 20 rows
            var remainder = i % 20;
            if(remainder === 0){
              insertAdvertisement();
            }
          }


          var table = new google.visualization.Table(document.getElementById('products-table'));

          //TODO set a fixed height here so you can scroll down and read more

          table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});

          // TODO - onclick of sorting needs to make an API call again to get data sorted by server
          // should turn off sorting locally
          //  I would suggest, however, that you investigate implementing server-side paging via AJAX calls.
          // Set up a script or servlet that hands out data in pieces, and an AJAX function on the client-side
          // that calls the server for the next piece of data (it could be one page, 5 pages, 100 pages,
          // whatever is most convenient for your application), and fills in the table piece-by-piece.
        };

          //                        TODO - paging scroll
          //                        https://github.com/hashchange/jquery.isinview
          // TODO - onscroll just redraw full table
          //                        http://stackoverflow.com/questions/11473143/jquery-automatically-scrolling-table-rows-but-with-table-header-fixed

      },
      error : function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR + textStatus + errorThrown);
      }
    });
  };

  loadProductsFromAPI();

  alert('WANKer');
})();
