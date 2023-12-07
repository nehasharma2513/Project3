
// Available routes:
// let booksURL = '/api/v1.0/books'
// let usersURL = /api/v1.0/users
// let reviewsURL = /api/v1.0/reviews 

function displayBarChart(){
    // you may need to install Chart.js 'npm install chart.js' or may not
    let booksURL = '/api/v1.0/books';
    fetch(booksURL)
    .then(response => response.json()) //Parse the repsonse to Json
    .then(booksData => {
        console.log(booksData)
        let authors_list=booksData.map(item=>item['Book-Author'])
        let Year_Publication=booksData.map(item=>item['Year-Of-Publication'])
        const ctx = document.getElementById('chartJsChart');
        new Chart(ctx, {
            type: 'bar',
            data: {
              labels: authors_list,
              datasets: [{
                label: 'Year',
                data: Year_Publication,
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
    })    
}

displayBarChart()

