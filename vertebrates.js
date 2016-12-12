var dataSet = [
    // species              class           continent       conservation status
    ['Giant panda',         'Mammal',       'Asia',         'Vulnerable'],
    ['Robin',               'Bird',         'Europe',       'Least concern'],
    ['Guam rail',           'Bird',         'Americas',     'Extinct in the wild'],
    ['Scimitar oryx',       'Mammal',       'Africa',       'Extinct in the wild'],
    ['Kaikatti bushfrog',   'Amphibian',    'Africa',       'Extinct in the wild'],
    ['Common barbel',       'Fish',         'Europe',       'Least concern'],
    ['Komodo dragon',       'Reptile',      'Asia',         'Vulnerable'],
    ['Orphan Salamander',   'Amphibian',    'Americas',     'Critically endangered'],
    ['Mongoose Lemur',      'Mammal',       'Africa',       'Critically endangered'],
    ['Spotted Turtle',      'Reptile',      'Americas',     'Endangered']
];
var vertebrateTable;

function setup_table ()
{
    vertebrateTable = $('.vertebrateTable').DataTable({
                          data:         dataSet,
                          deferRender:  false,
                          columns:      [
                                            { title: "Species",             class: "dt-left", visible: true, searchable: true },
                                            { title: "Class",               class: "dt-left", visible: true, searchable: true, chart: "#classChart" },
                                            { title: "Continent",           class: "dt-left", visible: true, searchable: true, chart: "#continentChart" },
                                            { title: "Conservation Status", class: "dt-left", visible: true, searchable: true, chart: "#conservationChart" },
                                        ]
                      });

    $('.vertebrateTable').append(
        '<tfoot><tr>'
        +'<td><input type=text class="columnSearch" placeholder="Search Species"></td>'
        +'<td><input type=text class="columnSearch" placeholder="Search Class"></td>'
        +'<td><input type=text class="columnSearch" placeholder="Search Continent"></td>'
        +'<td><input type=text class="columnSearch" placeholder="Search Status"></td>'
        +'</tr></tfoot>'
    );

    $('.columnSearch').on('keyup', function () {
        var col_index = $(this).closest('td').index();
        vertebrateTable.column(col_index).search(this.value).draw();
    });

}

