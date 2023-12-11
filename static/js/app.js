// Available routes:
// let booksURL = '/api/v1.0/books'
// let usersURL = /api/v1.0/users
// let reviewsURL = /api/v1.0/reviews 
// let reviewsURL = /api/v1.0/merged

//Part 1: Route Definitions and Constants

// Define colors for the doughnut chart
const doughnutChartColors = [
  'rgb(211,211,211,0.8)',  //grey
  'rgba(255, 0, 0, 0.8)', //red
  'rgb(255, 229, 180, 0.8)',  // orange
  'rgba(255, 255, 0, 0.8)',  // yellow
  'rgba(0, 153, 76, 0.8)',    // green
];

// Define font for chart title
const titleFont={
  family: 'Arial, Helvetica, sans-serif',
  size: 16
};


//Part 2: Utility Functions

// Utility function to calculate the average of a list
function avgList(list){
    if (list.length>0){
        let sum=0;
        for (let i of list){
            sum+=i
        }
        let avgL=sum/list.length
        return avgL.toFixed(2)}
    else {return null}
}

// Utility function to group review scores by their values
function groupByReviewScore(listScores){
  counts=[];
  for (let i=1;i<11; i++){
    counts.push(listScores.filter(j=>j==i).length)
  }
  return counts
}

// Utility function to generate text for a hint in the bubble chart
function generateGroupsText(listOfGroups){
    let scoresText=``;
    for (let i=0; i<listOfGroups.length; i++){
      if (listOfGroups[i]>0){
        if (listOfGroups[i]>1){
        scoresText+=`  - score <b>${i+1}</b>: was given <b>${listOfGroups[i]}</b> times <br>`;}
        else {scoresText+=`  - score <b>${i+1}</b>: was given <b>${listOfGroups[i]}</b> time <br>`;}
      }}
    return scoresText;  
    }

// Utility function to normalize the size of a list within a specified range
function normilizedSizeList(valuesList,maxS,minS){
  // define acceptable range of values [minAcceptable;maxAcceptable]
  // and then having max and min for the whole set convert any value within the range into [0;1]: projected01=(value-min)/(max-min)
  // then convert projected01 into value within range [minAcceptable;maxAcceptable]: projected01*(maxAcceptable-minAcceptable)+minAcceptable
  // https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
  let minAcceptable=5;
  let maxAcceptable=74;
  return valuesList.map(value=>(minAcceptable+(value-minS)*(maxAcceptable-minAcceptable)/(maxS-minS)));
}

// Utility function to find the minimum and maximum values in a list
function MinMax(listYears) {  
  return [Math.min(...listYears),Math.max(...listYears)];
}

// Utility function to group books into quadrants based on reader engagement
function groupQuadrants(listOfObj,maxReviewCounts){
  // create an object with number of author's book per each of defined category,
  // which are quadrants: 
  //Q1 - avgScore<5, ReviewsCount<maxReviewCounts/2
  //Q2 - avgScore>=5, ReviewsCount<maxReviewCounts/2
  //Q3 - avgScore<5, ReviewsCount>=maxReviewCounts/2
  //Q4 - avgScore>=5, ReviewsCount>=maxReviewCounts/2
  // as well as a category with No Reviews at all
  let numberBooks=[];
  let yearPubl=[[],[],[],[],[]];
  const nameCategory = ['No Reviews', 'Q1 - Not Very Popular, Not Much Loved', 'Q2 - Not Very Popular, But Loved', 'Q3 - Popular, Not Much Loved', 'Q4 - Popular and Loved'];
  for (let i=0; i<5; i++){
    numberBooks[i]=0;
  }
  for (let obj of listOfObj){
    if (obj.reviewsCount>0 && obj.avrScore<5 && obj.reviewsCount<maxReviewCounts/2){
      numberBooks[1]+=1;
      yearPubl[1].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount>0 && obj.avrScore>=5 && obj.reviewsCount<maxReviewCounts/2){
      numberBooks[2]+=1;
      yearPubl[2].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount>0 && obj.avrScore<5 && obj.reviewsCount>=maxReviewCounts/2){
      numberBooks[3]+=1;
      yearPubl[3].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount>0 && obj.avrScore>=5 && obj.reviewsCount>=maxReviewCounts/2){
      numberBooks[4]+=1;
      yearPubl[4].push(+obj.YearOfPublication);
    }
    else if (obj.reviewsCount==0){
      numberBooks[0]+=1;
      yearPubl[0].push(+obj.YearOfPublication);
    }
  }
  let minMaxY=[];
  for (let i=0; i<yearPubl.length; i++){
    minMaxY[i]=[];
    minMaxY[i]=MinMax(yearPubl[i]);
   }

  return {
    'values':numberBooks,
    'categoryNames':nameCategory,
    'publicationYears':minMaxY
  }
}


//Part 3: Bubble Chart Plotting Function

// Function to plot the bubble chart
function plotBubble(listOfObjects,maxReviewCounts,author,overalMAxYear,overalMinYear){
  // plot the bubble chart
  let yearOfPublicationList=listOfObjects.map(item => item.YearOfPublication);
  let yearOfPublicationListNormilized=normilizedSizeList(yearOfPublicationList,overalMAxYear,overalMinYear);
  // x-axis will represent the count of reviews
  let reviewsCount=listOfObjects.map(item => item.reviewsCount);
  // y-axis will represent the average rating score
  let avgRatingScore=listOfObjects.map(item => item.avrScore);
  let deltaX=maxReviewCounts/12;
  let xAxis=[]
  if (maxReviewCounts>6){
    let step=Math.ceil(maxReviewCounts/6) // not more than 8 points at xAxis
    for (let i=0; i<=6;i++){
      xAxis.push(i*step);
    }
  }
  else {
    for (let i=0; i<=maxReviewCounts;i++){
      xAxis.push(i);
    }
  }
  let yAxis = [];
  for (let i=0; i<=10;i+=2){
    yAxis.push(i);
  }

  const deltaY=2;
  
  let traceBubble = {
      x: reviewsCount,
      y: avgRatingScore,
      mode: 'markers',
      marker: { 
          color: '#1f77b4',
          size:  yearOfPublicationListNormilized,
          line: {
            color: 'black', 
            width: 1
          }},
      text: listOfObjects.map(item=>` Book Title: <b>${item.bookTitle}</b><br> Year of Publication: <b>${item.YearOfPublication}</b> <br> Total <b>${item.reviewsCount}</b> Reviews:<br> ${generateGroupsText(item.scoresCount)}<br>`),
    };

    let data_bubble = [traceBubble];
    let backgroundOpacity=0.05
    let layout_bubble = {
      title: {
          text: `<b> Quadrant Analysis of Reader Engagement for ${author}</b> <br>Reflects Lovability and Popularity, with Larger Markers for Recent Releases`,
          font: titleFont}, 
      xaxis: {title: 'Reviews Count',
      zeroline: false, 
      tickvals: xAxis, 
      ticktext: xAxis, 
      range: [0-deltaX, maxReviewCounts+deltaX],
      showgrid: false},
      yaxis: {title: 'Average Rating Score',
      zeroline: false, 
      tickvals: yAxis, 
      ticktext: yAxis, 
      range: [0-deltaY, 10+deltaY],
      showgrid: false},
      shapes: [{
        type: 'line',
        x0: maxReviewCounts/2,
        y0: 0-deltaY,
        x1: maxReviewCounts/2,
        y1: 10+deltaY,
        line: {
          color: 'grey',
          width: 0.5,
          dash: 'dot'
        }
      }, {
        type: 'line',
        x0: 0-deltaX,
        y0: 5,
        x1: maxReviewCounts+deltaX,
        y1: 5,
        line: {
          color: 'grey',
          width: 0.5,
          dash: 'dot'
        }
      },
      {
        type: 'rect',
        x0: 0-deltaX,
        y0: 0-deltaY,
        x1: maxReviewCounts/2, 
        y1: 5, 
        fillcolor: 'red', 
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        x0: maxReviewCounts/2,
        y0: 0-deltaY,
        x1: maxReviewCounts+deltaX, 
        y1: 5,
        fillcolor: 'orange',
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        x0: 0-deltaX,
        y0: 5,
        x1: maxReviewCounts/2,
        y1: 10+deltaY, 
        fillcolor: '#bcbd22',  ///yellow 
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      },
      {
        type: 'rect',
        x0: maxReviewCounts/2,
        y0: 5,
        x1: maxReviewCounts+deltaX,
        y1: 10+deltaY,
        fillcolor: 'darkgreen', 
        opacity: backgroundOpacity,
        line: {
          width: 0
        }
      }],
      padding: { t: 5, r: 5, b: 5, l: 5 },
      margin: { t: 55, r: 55, b: 55, l: 55 }
    };
  
    Plotly.newPlot("doughnutBubbleChart", data_bubble, layout_bubble, {responsive:true});
}


//Part 4: Donut Chart Plotting Function

// Function to plot the donut chart
function plotDonutChart(proportionQ,author,minY,MaxY){
  //plot the donut chart, using pie chart approach but with the hole defined
  let pieDiv = document.getElementById("doughnutBubbleChart");
  let values = proportionQ.values;
  let names = proportionQ.categoryNames;
  let years = proportionQ.publicationYears;
  let valuesToPlot=[], namesToPlot=[], colorsToPlot=[], yearsToPlot=[];
  for (let i=0; i<5; i++){
    if (values[i]>0){
      namesToPlot.push(names[i]);
      valuesToPlot.push(values[i]);
      colorsToPlot.push(doughnutChartColors[i]);
      yearsToPlot.push(years[i]);
    }
  }
  let texthint=[];
  for (let i=0; i<yearsToPlot.length;i++){
    texthint[i]=`Year of Publication: starting ${yearsToPlot[i][0]} with ${yearsToPlot[i][1]} latest`
    if (yearsToPlot[i][0]==yearsToPlot[i][1]){
      texthint[i]=`The only Year of Publication ${yearsToPlot[i][0]}`
    }
  }
  let wholeBooks=0;
  for (let i of values){
    wholeBooks+=i;
  }

  let traceA = {
    type: "pie",
    values: valuesToPlot,
    labels: namesToPlot,
    hole: 0.5,
    text: texthint,
    hoverinfo: 'text+percent',
    textinfo: 'none',
    marker: {
      colors: colorsToPlot}
  };

  let data = [traceA];

  let titletext=`<b>Distribution by Reader Engagement for ${author}</b> <br>Years of Publication: ${minY}-${MaxY}`;
  if (minY==MaxY){
    titletext=`<b>Distribution by Reader Engagement for ${author}</b> <br>Year of Publication: ${minY}`
  }

  let holeText=`Total of<br><b>${wholeBooks}</b><br>books`
  if (wholeBooks==1){
    holeText=`Total of<br><b>${wholeBooks}</b><br>book`
  }

  let layout = {
    title: {
      text:titletext,
      font: titleFont},
    annotations: [
      {
          font: {
              size: 14,
              family: 'Arial, Helvetica, sans-serif',
              color: '(64,64,64,0.9)' 
          },
          showarrow: false,
          text: holeText,  
          x: 0.5,
          y: 0.5
      }
  ]
  };
  Plotly.newPlot(pieDiv, data, layout);
}



//Part 5: Data Loading and Initialization
//Define the API endpoint
let merged = '/api/v1.0/merged';

// Load the data using D3
d3.json(merged).then(function(data){ 
  // Extract relevant data and initialize default values
  let maxReviewCounts = Math.max(...data.map(item => item.Ratings.length));
  let yearOfPublicationList = data.map(item => item['Year-Of-Publication']);
  let maxOverallYear = Math.max(...yearOfPublicationList);
  let minOverallYear = Math.min(...yearOfPublicationList);
  let authorsList = [...new Set(data.map(item => item['Book-Author']))].sort();
  let author = data.filter(book => book.Ratings.length === maxReviewCounts)[0]['Book-Author'];

  console.log(maxOverallYear)
  console.log(minOverallYear)
  
// Map Initialization
console.log("Initializing Leaflet map")
  var myMap = L.map('map').setView([0, 0], 2);

  // Add layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

console.log("Leaflet map initialized");

  // Loop through the data and add markers
  data.forEach(record => {
    // Extract latitude and longitude 
    var lat = record['Ratings'][0]['User']['Geo-Data']['Lat'];
    var long = record['Ratings'][0]['User']['Geo-Data']['Long'];

    // Add a marker to the map
    var marker = L.marker([lat, long]).addTo(myMap);

    // Function to calculate marker size based on the number of reviews
    function getSize(reviewsCount) {
      return reviewsCount * 5;
    }

    // Function to calculate marker color based on the average rating
    function getColor(rating) {
      if (rating >= 8) {
        return '#1a9850';
      } else if (rating >= 6) {
        return '#fee08b';
      } else {
        return '#d73027';
      }
    }

    // Add a popup to the marker
    marker.bindPopup(`
      <b>Book Title:</b> ${record['Book-Title']}<br>
      <b>Book Author:</b> ${record['Book-Author']}<br>
      <b>Publisher:</b> ${record['Publisher']}<br>
      <b>Year of Publication:</b> ${record['Year-Of-Publication']}<br>
      <b>User Rating:</b> ${record['Ratings'][0]['Book-Rating']}<br>
      <b>User Location:</b> ${record['Ratings'][0]['User']['Location']}
    `);
  });
})
.catch(error => console.error('Error loading data:', error));

  //select the author that has max review counts and set it as default one
  let bookWithMaxReview=data.filter(book => book.Ratings.length == maxReviewCounts);
  let author= bookWithMaxReview[0]['Book-Author'] // author that will be selected by default

  // Initialize the dropdown menu with authors and set default values
  let dropdownMenu = d3.select("#selDataset");
  // https://stackoverflow.com/questions/56307874/how-do-i-use-d3-to-i-populate-drop-down-options-from-json
  let options = dropdownMenu.selectAll('option')
      .data(authors_list)
      //d3 sees we have less elements (0) than the data, so we are tasked to create
      //these missing inside the `options.enter` pseudo selection.
      //if we had some elements from before, they would be reused, and we could access their
      //selection with just `options`
      options.enter()
      .append('option')
      .attr('value', d=>d)
      .text(d=>d);
  //set very default value for a dropdown
  dropdownMenu.property('value', author);

   // Listen for changes in the dropdown menu
  d3.selectAll("#selDataset").on("change", function(){
    author = this.value;
    optionChanged(author);
  });

 // initialization of Quadrant part
  function plotDefaultWithinQuadrantPart(selectedAuthor){
    author=selectedAuthor;
    // Generate a list of dictionaties for each book of the author, which has title, ISBN, publication year, average rating score and reviews count
    let authorBooks=data.filter(function(bookitem){return bookitem['Book-Author']==author})
    let AuthorBookTPACListOfObjects=authorBooks.map(
      item => { 
      let reviewsList = item.Ratings.map(i=>i['Book-Rating'])
      let scoresCount=groupByReviewScore(reviewsList)
      return {
          'ISBN':item['ISBN'],
          'bookTitle':item['Book-Title'],
          'YearOfPublication': item['Year-Of-Publication'],
          'avrScore': avgList(reviewsList),
          'reviewsCount': reviewsList.length,
          'scoresCount':scoresCount
        } 
    })

    // calculate number of books in each quadrant and those without reviews
    let proportionQ=groupQuadrants(AuthorBookTPACListOfObjects,maxReviewCounts)
    let minY=Math.min(...AuthorBookTPACListOfObjects.map(item=>item.YearOfPublication));
    let maxY=Math.max(...AuthorBookTPACListOfObjects.map(item=>item.YearOfPublication));

       //Part 6: Dropdown Change Event Function

	// Listen for radio button changes
    d3.selectAll("input[name='chart']").on("change", function() {
      var selectedChart = this.value;
      if (selectedChart == "doughnutChart") {
        plotDonutChart(proportionQ, author, minY, maxY);
      } else if (selectedChart == "bubbleChart") {
        plotBubble(AuthorBookTPACListOfObjects, maxReviewCounts,author,maxOverallYear,minOverallYear);
      }

    });

    //plot a bubble chart initially
    plotBubble(AuthorBookTPACListOfObjects, maxReviewCounts,author,maxOverallYear,minOverallYear);

  }
 // render initial Quadrant plots
  plotDefaultWithinQuadrantPart(author)

     // Function to update the Leaflet map based on the selected author
function updateMap(author) {
  // Clear existing markers on the map
  clearMap();

// Function to clear markers from the map
function clearMap() {
  myMap.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });
}
      

// Function called when a dropdown menu item is selected
  function optionChanged(new_author){
    //make 'bubbleChart' as default radio button selection 
    let radioButtonThatCorrespondsToBubble = d3.select("input[name='chart'][value='bubbleChart']");
    radioButtonThatCorrespondsToBubble.property("checked", true);
    
    // Render quadrant plots after the change of dropdown item
    plotDefaultWithinQuadrantPart(new_author)

  }


};




