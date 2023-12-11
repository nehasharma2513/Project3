
// Available routes:
// let booksURL = '/api/v1.0/books'
// let usersURL = /api/v1.0/users
// let reviewsURL = /api/v1.0/reviews 
// let reviewsURL = /api/v1.0/merged

const doughnutChartColors = [
  'rgb(211,211,211,0.8)',  //grey
  'rgba(255, 0, 0, 0.8)', //red
  'rgb(255, 229, 180, 0.8)',  // orange
  'rgba(255, 255, 0, 0.8)',  // yellow
  'rgba(0, 153, 76, 0.8)',    // green
];

const titleFont={
  family: 'Arial, Helvetica, sans-serif',
  size: 16
};

let ChartJsArea; // created for tracking of the chart already built using chart js

//find an average for a list
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

//having an input list of rating scores for a book, group them by their values and find the count (lenght of a respective list)
function groupByReviewScore(listScores){
  counts=[];
  for (let i=1;i<11; i++){
    counts.push(listScores.filter(j=>j==i).length)
  }
  return counts
}

// Generate a text for a hint of bubble within Quadrant chart that represents a distribution between ratings
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

function normilizedSizeList(valuesList,maxS,minS){
  // define acceptable range of values [minAcceptable;maxAcceptable]
  // and then having max and min for the whole set convert any value within the range into [0;1]: projected01=(value-min)/(max-min)
  // then convert projected01 into value within range [minAcceptable;maxAcceptable]: projected01*(maxAcceptable-minAcceptable)+minAcceptable
  // https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
  let minAcceptable=3;
  let maxAcceptable=55;
  return valuesList.map(value=>(minAcceptable+(value-minS)*(maxAcceptable-minAcceptable)/(maxS-minS)));
}

function shortenString(stringContent, maxNumberOfCharecters) {
  if (stringContent.length>maxNumberOfCharecters){
    return stringContent.substring(0, maxNumberOfCharecters) + '...'
  }
  else return stringContent
}

// just looking for a Max and Min of a list
function MinMax(listYears) {  
  return [Math.min(...listYears),Math.max(...listYears)];
}

function ChartJSTextToolTip(metric){
if (metric =='avrScore'){return 'Average Rating Score'}
else {return 'Total Reviews Count'}
}

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
          color: '#2986cc',
          opacity: 1,
          size:  yearOfPublicationListNormilized,
          line: {
            color: 'black', 
            width: 1
          }},
      text: listOfObjects.map(item=>` <b>${shortenString(item.bookTitle,37)}</b><br> Year of Publication: <b>${item.YearOfPublication}</b> <br> Total <b>${item.reviewsCount}</b> Review(s):<br> ${generateGroupsText(item.scoresCount)}<br>`),
    };

    let data_bubble = [traceBubble];
    let backgroundOpacity=0.1
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

function plotChartJS (authorAvgRCount,metric) {

  authorAvgRCount.sort((a, b) => {
    return b[metric] - a[metric];
});

  authorAvgRCount=authorAvgRCount.slice(0,10);

  //destroy previously plotted chart if such was plotted
  if (ChartJsArea) {
    ChartJsArea.destroy();
  }
  
  // plot a chart creating 
  ChartJsArea = new Chart(
    document.getElementById('chartJsChart'),
    {   
      type: 'bar',   
      options: {
        animation: false,
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: ChartJSTextToolTip(metric),  
            }
          },
          y: {
            title: {
              display: true,
              text: 'Author', 
            },
            ticks: {
              font: {
                size: 9
              }
          }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltips: {
            enabled: true,
          },
          title: {
            display: true,
            text: 'Top 10 Authors by '+ ChartJSTextToolTip(metric),
            font: titleFont
          }
        }
      },
      data: {
        labels: authorAvgRCount.map(item => item.author),
        datasets: [
          {
            label: ChartJSTextToolTip(metric),
            data: authorAvgRCount.map(item => item[metric]),
            backgroundColor: '#2986cc',
            hoverBackgroundColor: 'rgba(0,0,139,1)',
            hoverBorderColor: 'rgba(0,0,139, 1)',
          }
        ]
      }
    }
  );
  }


//Define the API endpoint
let merged = '/api/v1.0/merged';

//Load the data
d3.json(merged).then(function(data){ 
  //Find the maximum number of reviews book recieved in the whole db
  let maxReviewCounts=Math.max(...data.map(item=>item.Ratings.length));
  // find the max and min Year of Publications within the whole db, so that
  // size of the bubble within quadrant represent the year of book's publication
  let yearOfPublicationList=data.map(item => item['Year-Of-Publication']);
  let maxOverallYear=Math.max(...yearOfPublicationList);
  let minOverallYear=Math.min(...yearOfPublicationList);

  // add a dropdown menu
  // find authors and sort them
  let authors_list=[...new Set(data.map(item => item['Book-Author']))];
  authors_list=authors_list.sort();

  //select the author that has max review counts and set it as default one
  let bookWithMaxReview=data.filter(book => book.Ratings.length == maxReviewCounts);
  let author= bookWithMaxReview[0]['Book-Author'] // author that will be selected by default
  // add a dropdown and populates with authors list
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

  //and listen if the item was changed here, within the author dropdown
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

  // for the whole set of data 
  // Convert parsed data into a list of reviews groupped by author
  // Group data by author
  let authorReviews={};
  data.forEach(
    item => {
    let author = item['Book-Author'];
    let reviews = item.Ratings.map(i=>i['Book-Rating'])
    if (!(author in authorReviews)){
        authorReviews[author]=[]
    }
    reviews.forEach(item=>{authorReviews[author].push(item)})
    })
   //generate a list of dictionaries of book reviews's related data per author
    authorAvgRCount=[]
    for (let i of Object.keys(authorReviews)){
        tempDict={
            'author':i,
            'avrScore':avgList(authorReviews[i]),
            'reviewsCount': authorReviews[i].length}
        authorAvgRCount.push(tempDict)
    }

// Listen for radio button changes
d3.selectAll("input[name='barTypeChartJs']").on("change", function() {
  let selectedMetric = this.value;
  if (selectedMetric == "avgScore") {
    plotChartJS (authorAvgRCount,"avrScore");
  } else if (selectedMetric == "ReviewsCount") {
    plotChartJS (authorAvgRCount,"reviewsCount");
  }});

  plotChartJS(authorAvgRCount,"avrScore");

   ////////////////////////////
    //PLEASE ADD HERE FUNCTIONS THAT PLOT INITIAL CHARTS and any data retrival you need you can get here from variable data
    // \/\/\/\/\/\/
    ///////////////

      

// This function is called when a dropdown menu item is selected
  function optionChanged(new_author){
    //make 'bubbleChart' as default radio button selection 
    let radioButtonThatCorrespondsToBubble = d3.select("input[name='chart'][value='bubbleChart']");
    radioButtonThatCorrespondsToBubble.property("checked", true);
    
    // render quadrant plots after the change of dropdown item
    plotDefaultWithinQuadrantPart(new_author)
    
    ////////////////////////////
    //PLEASE ADD HERE FUNCTIONS THAT PLOT REST CHARTS AFTER DROPDOWN ITEM CHANGE and any data retrival you need you can get here from variable data
    // \/\/\/\/\/\/
    ///////////////
  }

});




