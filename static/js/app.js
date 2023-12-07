
// Available routes:
// let booksURL = '/api/v1.0/books'
// let usersURL = /api/v1.0/users
// let reviewsURL = /api/v1.0/reviews 
// let reviewsURL = /api/v1.0/merged

const author='dfgdg'

function avgList(list){
    if (list.length>0){
        let sum=0;
        for (let i of list){
            sum+=i
        }
        return sum/list.length}
    else {return null}
}

function groupByReviewScore(listScores){
  counts=[];
  for (let i=1;i<11; i++){
    counts.push(listScores.filter(j=>j==i).length)
  }
  return counts
}

function generateGroupsText(listOfGroups){
    let scoresText=``;
    for (let i=0; i<listOfGroups.length; i++){
      if (listOfGroups[i]>0){
        if (listOfGroups[i]>1){
        scoresText+=`score <b>${i+1}</b>: was given <b>${listOfGroups[i]}</b> times \n`;}
        else {scoresText+=`score <b>${i+1}</b>: was given <b>${listOfGroups[i]}</b> time \n`;}
      }}
    return scoresText;  
    }

function normilizedSizeList(valuesList,maxS,minS){
  // define acceptable range of values [minAcceptable;maxAcceptable]
  // and then having max and min for the whole set convert any value within the range into [0;1]: projected01=(value-min)/(max-min)
  // then convert projected01 into value within range [minAcceptable;maxAcceptable]: projected01*(maxAcceptable-minAcceptable)+minAcceptable
  // https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
  let minAcceptable=10;
  let maxAcceptable=60;
  return valuesList.map(value=>(minAcceptable+(value-minS)*(maxAcceptable-minAcceptable)/(maxS-minS)));
}


function plotBubble(listOfObjects,maxReviewCounts){
  // plot the bubble chart
  // size of the bubble will represent the year of book's publication
  let yearOfPublicationList=listOfObjects.map(item => item.YearOfPublication);
  let maxYear=Math.max(...yearOfPublicationList);
  let minYear=Math.min(...yearOfPublicationList);
  let yearOfPublicationListNormilized=normilizedSizeList(yearOfPublicationList,maxYear,minYear);
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
    xAxis.push(maxReviewCounts);
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
      text: listOfObjects.map(item=>`Book Title: <b>${item.bookTitle}</b><br> Year of Publication: <b>${item.YearOfPublication}</b> <br> Reviews proportion:<br> ${generateGroupsText(item.scoresCount)}<br>`),
    };

    let data_bubble = [traceBubble];
    let backgroundOpacity=0.05
    let layout_bubble = {
      title: {
          text: `<b> Popularity vs Lovability for ${author}</b> <br>sized by year of publication`,
          font: {
              family: 'Arial, Helvetica, sans-serif',
              size: 16
          }}, 
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
  
    Plotly.newPlot("bubble", data_bubble, layout_bubble, {responsive:true});
}



//Define the API endpoint
let merged = '/api/v1.0/merged';

//Load the data
d3.json(merged).then(function(data){ 
  console.log(data);
  // //Convert parsed data into a list of reviews groupped by author
  // //Group data by author
  // let authorReviews={};
  // data.forEach(
  //   item => {
  //   let author = item['Book-Author'];
  //   let reviews = item.Ratings.map(i=>i['Book-Rating'])
  //   if (!(author in authorReviews)){
  //       authorReviews[author]=[]
  //   }
  //   reviews.forEach(item=>{authorReviews[author].push(item)})
  //   })
  //  //generate a list of dictionaries of book reviews's related data per author
  //   authorAvgRCount=[]
  //   for (let i of Object.keys(authorReviews)){
  //       tempDict={
  //           'author':i,
  //           'avrScore':avgList(authorReviews[i]),
  //           'reviewsCount': authorReviews[i].length}
  //       authorAvgRCount.push(tempDict)
  //   }
  // // Find the max reviews count for the whole data set
  // let  maxReviewsCountAuthor=Math.max(...authorAvgRCount.map(item=>item.reviewsCount));

  let maxReviewCounts=Math.max(...data.map(item=>item.Ratings.length));
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

  plotBubble(AuthorBookTPACListOfObjects, maxReviewCounts)

  // to show a plot that shows there are books without ratings as well

});




