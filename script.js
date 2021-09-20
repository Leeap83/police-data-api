const postcodeSearch = document.forms[0]
const userPostcode = document.getElementById('userPostcode')
const lastUpdate = document.getElementById('lastUpdate')
const totalCrimes = document.getElementById('totalCrimes')
const hidden = document.getElementById('hidden')

postcodeSearch.addEventListener('submit', (e) => {
    e.preventDefault()
    new FormData(postcodeSearch)
})

postcodeSearch.addEventListener('formdata', (e) => {
    const postcode = e.formData.get('postcode')

    userPostcode.innerText = postcode

    const getPostcode = 'https://api.postcodes.io/postcodes/' + encodeURIComponent(postcode)

    fetch(getPostcode)
        .then(
            res => res.json())
        .then(
            postcodeData => {
                let lat = postcodeData.result.latitude
                let long = postcodeData.result.longitude

                const Crimes_url = 'https://data.police.uk/api/crimes-street/all-crime?lat=' + lat + '&lng=' + long

                fetch(Crimes_url)
                    .then(res => res.json())
                    .then(crimeData => {

                        lastUpdate.innerText = new Date(crimeData[0].month).toLocaleDateString(
                            'en-gb',
                            {
                                year: 'numeric',
                                month: 'long',
                            }
                        )

                        totalCrimes.innerText = crimeData.length.toString()

                        let categories = Object.values(crimeData.reduce((obj, { category }) => {
                            if (obj[category] === undefined)
                                obj[category] = { category: category, count: 1 };
                            else
                                obj[category].count++;
                            return obj;
                        }, {}));

                        let options = {
                            chart: {
                                type: 'donut',
                            },
							plotOptions: {
								pie: {
								  startAngle: -90,
								  endAngle: 270
								}
							},
                            dataLabels: {
                                enabled: false
                            },
							fill: {
								type: 'gradient',
							},
							title: {
								text: 'Reported Crimes'
							},
                            series: [],
                            labels: [],
                            noData: {
                                text: 'Loading...'
                            },
                            total: {
                                show: true
                            },
                            responsive: [{
                                breakpoint: undefined,
                                options: {
                                  legend: {
                                    position: 'bottom'
                                  }
                                }
                            }]
                        };

                        let crimeType = new ApexCharts(document.getElementById('chart'), options)

                        crimeType.render()

                        let crimes = []
                        let crimeCat = []

                        for (let i = 0; i < categories.length; i++) {
                            crimes.push(categories[i].count)
                            crimeCat.push(categories[i].category.replace(/-/g, ' '))
                        }

                        crimeType.updateOptions({labels: crimeCat})
                        crimeType.updateSeries(crimes)

                        hidden.id = 'visible'

                    })
                    .catch(console.error)
            }
        )
        .catch(console.error)
})