(() => {

    const formatPriceAsDollars = (inputPrice) =>{
        return '$' + inputPrice + '.00';
    };

    const generateRandomNumber = () => {
        let randomNumber = Math.floor(Math.random()*1000);
        // If there is a local storage key for this random number re-generate
        // TODO - I observed the same images being returned for different ID's
        if(localStorage.getItem(randomNumber) === "Ad shown"){
            generateRandomNumber();
        }else{
            return randomNumber;
        }
    };

    const generateRandomAdvertisement = () => {
        let randomNumber = generateRandomNumber();
        localStorage.setItem(randomNumber, "Ad shown");
        return `<img class="ad" src="/ad/?r=${randomNumber}"/>`;
    };

    const insertAdvertisementIfNeeded = (productCountIterator) => {
         let previousRow = productCountIterator - 1;
        let isPreviousRowAMultipleofTwenty = previousRow % 20 === 0;
        // not the prettiest but working
        let howManyAdsCurrentlyOnDisplay = $('#products-table img').length;
        let whereToPlaceAd = productCountIterator + (howManyAdsCurrentlyOnDisplay * 20);

        if(previousRow != 0 && isPreviousRowAMultipleofTwenty){
            $('#products-table tr').eq(whereToPlaceAd).after(generateRandomAdvertisement());
        }
    };
    const calculateDifferenceBetweenDates = (firstInputDate, secondInputDate) => {
        var oneDayinMilliSeconds = 24*60*60*1000;
        return Math.round(Math.abs((firstInputDate - secondInputDate)/(oneDayinMilliSeconds)))
    };
    const howManyDaysOld = (productUploadDate) => {
        let now = new Date();
        let inputDate = Date.parse(productUploadDate);
        let differenceBetweenDatesInDays = calculateDifferenceBetweenDates(now , inputDate);

        return differenceBetweenDatesInDays;
    };

    const formatDayTextGrammar = (productUploadDaysAgo) => {
        let dayText;
            if(productUploadDaysAgo === 1){
                dayText = 'day';
            }else{
                dayText = 'days';
            }
        return dayText;
    };

    const formatDate = (productUploadDate) => {

        let productUploadDaysAgo = howManyDaysOld(productUploadDate);
        let dayText = formatDayTextGrammar(productUploadDaysAgo);

        let formattedDateString;
             if(productUploadDaysAgo <= 7){
                 formattedDateString = `${productUploadDaysAgo} ${dayText} ago`;
            }else{
                 formattedDateString = productUploadDate;
            }
        return formattedDateString;
    };

    const formatAsciiFaceToCorrectSize = (asciiFace, asciiFaceSize) => {
        return `<span style="font-size:${asciiFaceSize}px">${asciiFace}</span>`;
    };


    const populateProductTableData = (tableInputData) => {
        for(var productCountIterator = 0; productCountIterator < tableInputData.length; productCountIterator++){
            let asciiFace = formatAsciiFaceToCorrectSize(tableInputData[productCountIterator]['face'], tableInputData[productCountIterator]['size']);
            let asciiFacePrice = formatPriceAsDollars(tableInputData[productCountIterator]['price']) ;
            let asciiFaceSize = tableInputData[productCountIterator]['size'];
            let asciiFaceDate = formatDate(tableInputData[productCountIterator]['date']);
            let asciiFaceProductID = tableInputData[productCountIterator]['id'];
            let productTableRowEntry = `<tr><td>${asciiFace}</td><td>${asciiFacePrice}</td><td>${asciiFaceSize}</td><td>${asciiFaceDate}</td><td>${asciiFaceProductID}</td></tr>`;
            insertAdvertisementIfNeeded(productCountIterator);
            $("#products-table tbody").append(productTableRowEntry);
        }
    };
    const drawProductTable = () =>{
        $("#products-table").html('');

        let productTableHeaderFields =`<thead><tr>
                                        <th class="products-table__face">Face</th>
                                            <th class="products-table__price">Price</th>
                                            <th class="products-table__size">Size</th>
                                            <th class="products-table__date">Date</th>
                                            <th class="products-table__id">Product ID</th>
                                        </tr></thead>`;

        $("#products-table").prepend(productTableHeaderFields);
        $("#products-table").append('<tbody>');
        $("#products-table").append('</tbody>');
    };

    let loadProductsFromAPI = (limitRowsReturnedTo, paginateSkipResults, sortByField) => {
        $('.loading').show();

        $.ajax({
            type: 'GET',
            url: '/api/products',
            data: {
                limit: limitRowsReturnedTo,
                skip: paginateSkipResults,
                sort: sortByField
            },
            dataType: 'text',
            success: function(resultData) {
                var jsonString = '[' + resultData.replace(/\n/g, ',').slice(0, -1) + ']';
                var tableInputData = $.parseJSON(jsonString);

                if(paginateSkipResults){

                    let rowReturnedCount = tableInputData.length;
                    if(rowReturnedCount=== 0){
                        // I know, an ugly alert! but you said its OK to be ugly!
                        alert('~ end of catalogue ~');
                    }else{
                        populateProductTableData(tableInputData);
                    }
                }else{
                    drawProductTable(tableInputData);
                    populateProductTableData(tableInputData);
                }
                $('.loading').hide();

            },
            error : function(jqXHR, textStatus, errorThrown) {
                $('.loading').hide();
                $('.products').text("Could not load any data: " + textStatus + " error thrown: " + errorThrown);
            }
        });
    };

    // lets use some globals
    let defaultResultSetLimit = 25;
    let defaultPaginateSkipResults = '';
    let currentSortingParameter = '';
    // initialise data on first load of page
    loadProductsFromAPI(25, defaultPaginateSkipResults, currentSortingParameter);

    $('.sorting button').click(function() {
        currentSortingParameter = $(this).attr("value");
        loadProductsFromAPI(25, '' , currentSortingParameter);
    });

    $('.products').scroll(function() {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            let currentTableLength = $('.products tbody tr').length;
            loadProductsFromAPI(defaultResultSetLimit, currentTableLength , currentSortingParameter);
        }
    });

})();
