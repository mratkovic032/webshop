$(document).ready(function() {
    $("li.dropdown").hover(
	function() {$(this).find('.dropdown-menu').stop(true, true).delay(50).slideDown(200);}, 
	function() {$(this).find('.dropdown-menu').stop(true, true).delay(50).slideUp(200);
    });
});

var app = angular.module('webshop', ['ui.bootstrap']);
app.controller('webshop_ctrl', function($scope, $window, $http, $log, $uibModal) {
    var vm = this;
    vm.search_text = "";
    vm.message = "";
    vm.proizvodi = [];
    vm.svi_proizvodi = [];
    vm.kategorije_proizvoda = {};
    vm.lista_kategorija = [];
    vm.kategorija = null;
    vm.proizvod = null;
    
    //alerts
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //pagination variables
    vm.total_items;
    vm.current_page = 1;
    vm.items_per_page = 18;
    vm.max_size = 5;
    
    //init function
    vm.init = function () {
        var req = {
            method: "GET",
            url: "json/k2_proizvodi.json"
        };
        $http(req).then(
                function (resp) {
                    console.log(resp);
                    var lista = [];
                    vm.svi_proizvodi = resp.data;
                    vm.kategorije_proizvoda = {};
                    vm.lista_kategorija = [];
                    for (var i in vm.svi_proizvodi) {
                        var proizvod = vm.svi_proizvodi[i];
                        if (!(proizvod.kategorija in vm.kategorije_proizvoda)) {
                            vm.lista_kategorija.push(proizvod.kategorija);
                            vm.kategorije_proizvoda[proizvod.kategorija] = [proizvod];
                        } else {
                            vm.kategorije_proizvoda[proizvod.kategorija].push(proizvod);
                        }
                        lista.push(proizvod);
                    }
                    console.log(vm.kategorije_proizvoda);
                    vm.total_items = lista.length;
                    vm.proizvodi = lista;
                    console.log(vm.proizvodi);
                }, function (resp) {
                    vm.message = "error";
                });
    };
    vm.init();
    
    vm.filter = function (parameter) {
        if (parameter === 'search') {
            var lista = [];
            for (var i in vm.svi_proizvodi) {
                var proizvod = vm.svi_proizvodi[i];
                if (proizvod.naziv.toLowerCase().indexOf(vm.search_text.toLowerCase()) !== -1) {
                    lista.push(proizvod);
                }
            }
            vm.total_items = lista.length;
            vm.proizvodi = lista;
        }
    };
    
    vm.filter_rating = function (rating) {        
        var lista = [];
        for (var i in vm.svi_proizvodi) {
            var proizvod = vm.svi_proizvodi[i];
            if (proizvod.ocena === rating) {
                lista.push(proizvod);
            }
            vm.total_items = lista.length;
            vm.proizvodi = lista;
        }
    };
    vm.od;
    vm.do;
    vm.filter_price = function () {
        console.log(parseFloat(vm.od), vm.do);
        var lista = [];
        for (var i in vm.svi_proizvodi) {
            var proizvod = vm.svi_proizvodi[i];
            if (proizvod.cena >= parseFloat(vm.od) && proizvod.cena <= parseFloat(vm.do)) {
                lista.push(proizvod);
            }
        }
        vm.total_items = lista.length;
        vm.proizvodi = lista;
        vm.od = null;
        vm.do = null;
    };
    
    vm.filter_cat = function (cat) {
        vm.kategorija = cat;
        vm.proizvod = null;
        vm.proizvodi = vm.kategorije_proizvoda[cat];
        vm.total_items = vm.proizvodi.length;
    };
    
    vm.selektuj_proizvod = function (item) {
        vm.proizvod = item;
        vm.kategorija = item.kategorija;
        console.log(vm.proizvod);
    };
    
    vm.pocetna = function() {
        vm.proizvod = null;
        vm.kategorija = null;
        vm.current_page = 1;
        vm.proizvodi = vm.svi_proizvodi;
        vm.total_items = vm.proizvodi.length;
    };
    
    vm.state = "";
    vm.users = [];
    vm.show_login = true;
    vm.show_reg = true;
    vm.logged_in = null;
    vm.show_modal = function (req) {
        if (req === 'login') {
            vm.state = "login";
        } else {
            vm.state = "reg";
        }
        
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modal.html',
            controller: function ($uibModalInstance, parent) {
                var vm2 = this;
                vm2.state = parent.state;
                
                vm2.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                vm2.signup_name = "";
                vm2.signup_password = "";
                vm2.confirmed_password = "";
                vm2.register = function () {
                    console.log(parent.users);
                    var name_taken = false;
                    console.log(vm2.signup_name, vm2.signup_password);
                    for (var i in parent.users) {
                        if (vm2.signup_name === parent.users[i].name) {
                            name_taken = true;
                        }
                    }
                    if (name_taken) {
                        $scope.alerts.push({type: 'danger', msg: 'Korisnicko ime je zauzeto'});
                        return;
                    }
                    if (vm2.signup_name === "" || vm2.signup_password === "" || vm2.confirmed_password === "") {
                        $scope.alerts.push({type: 'warning', msg: 'Morate popuniti sva polja'});
                    } else if (vm2.signup_password === vm2.confirmed_password) {
                        $scope.alerts.push({type: 'success', msg: 'Uspesno ste se registrovali'});
                        parent.users.push({name: vm2.signup_name, pass: vm2.signup_password});
                        $uibModalInstance.dismiss('cancel');
                    } else {
                        $scope.alerts.push({type: 'danger', msg: 'Lozinkai ponovljena lozinka moraju biti iste'});
                    }
                    console.log(parent.users);
                };
                vm2.login_name = "";
                vm2.login_password = "";
                
                vm2.login = function () {
                    if (vm2.login_name === "" || vm2.login_password === "") {
                        $scope.alerts.push({type: 'warning', msg: 'Morate popuniti sva polja'});
                    }
                    var not_registered = true;
                    for (var i in parent.users) {
                        if (vm2.login_name === parent.users[i].name) {
                            not_registered = false;
                        }
                    }
                    if (not_registered) {
                        $scope.alerts.push({type: 'danger', msg: 'Korisnik ' + vm2.login_name + ' nije registrovan'});
                        return;
                    }
                    console.log("Korisnik je registrovan");
                    var wrong_pass = false;
                    for (var i in parent.users) {
                        if (vm2.login_name == parent.users[i].name && vm2.login_password !== parent.users[i].pass) {
                            $scope.alerts.push({type: 'danger', msg: 'Pogresna lozinka'});
                            wrong_pass = true;
                        }
                    }
                    if (wrong_pass) {
                        console.log("pogresna lozinka");
                        return;
                    }          
                    for (var i in parent.users) {
                        if (vm2.login_name === parent.users[i].name && vm2.login_password === parent.users[i].pass) {
                            $scope.alerts.push({type: 'success', msg: vm2.login_name + ' se uspesno ulogovao / la'});
                            $uibModalInstance.dismiss('cancel');
                            parent.show_login = false;
                            parent.show_reg = false;
                            parent.logged_in = vm2.login_name;
                            console.log(parent.logged_in);
                        }
                    }
                };
            },
            controllerAs: 'vm2',
            resolve: {
                parent: function () {
                    return vm;
                }
            }
        });
        
        modalInstance.result.then(function () {
            
        }, function () {
            console.log('modal-component dismissed at: ' + new Date());
        });
    };
    
    vm.logout = function () {
        vm.logged_in = null;
        vm.show_login = true;
        vm.show_reg = true;
        $scope.alerts.push({type: 'info', msg: 'Uspesno ste se izlogovali. Hava Vam sto ste koristili nasu aplikaciju'});
    };
    vm.quantity;
    vm.buy = function (item) {
        console.log(item);
        console.log(vm.quantity);
        console.log(item.kolicina);
        if (vm.logged_in === null) {
            $scope.alerts.push({type: 'danger', msg: 'Morate biti ulogovani ukoliko zelite da kupite proizvod'});
            vm.show_modal('login');
        } else if (vm.quantity > item.kolicina) {
            $scope.alerts.push({type: 'danger', msg: 'Ne raspolazemo tolikim kolicinama. Trenutna kolicina ovog proizvoda je: ' + item.kolicina});
        } else {
            if (vm.cart.length === 0) {
                vm.cart.push({item: item, quantity: vm.quantity, subtotal: 0});
                item.kolicina -= vm.quantity;
                $scope.alerts.push({type: 'success', msg: 'Proizvod je uspesno prebacen u korpu'});
                console.log(vm.cart);
            } else {
                var already_in_the_cart = false;
                for (var i in vm.cart) {
                    if (vm.cart[i].item.naziv === item.naziv) {
                        vm.cart[i].quantity += vm.quantity;
                        item.kolicina -= vm.quantity;
                        $scope.alerts.push({type: 'success', msg: 'Proizvod je uspesno prebacen u korpu'});
                        already_in_the_cart = true;
                        console.log(vm.cart);
                    }
                }
                if (!already_in_the_cart) {
                    vm.cart.push({item: item, quantity: vm.quantity, subtotal: 0});
                    item.kolicina -= vm.quantity;
                    $scope.alerts.push({type: 'success', msg: 'Proizvod je uspesno prebacen u korpu'});                    
                    console.log(vm.cart);
                }
            }
        }
    };
    
    vm.show_page_container = true;
    vm.show_cart_container = false;
    vm.cart = [];
    vm.total = 0;
    vm.show_cart = function () {
        if (vm.cart.length === 0) {
            $scope.alerts.push({type: 'info', msg: 'Korpa je prazna'});
        } else {
            vm.show_page_container = false;
            vm.show_cart_container = true;
            vm.kategorija = null;
            vm.proizvod = null;
            vm.total = 0;
            for (var i in vm.cart) {
                vm.cart[i].subtotal = vm.cart[i].quantity * vm.cart[i].item.cena;
                vm.cart[i].subtotal = vm.cart[i].subtotal.toFixed(2);
                vm.total = parseFloat(vm.total) + parseFloat(vm.cart[i].subtotal);
            }
            vm.total = vm.total.toFixed(2);            
        }
        console.log(vm.cart);
    };
    
    vm.continue_shopping = function () {
        vm.show_page_container = true;
        vm.show_cart_container = false;
        vm.kategorija = null;
        vm.proizvod = null;
        vm.proizvodi = vm.svi_proizvodi;
        vm.total_items = vm.proizvodi.length;
    };
    
    vm.delete_item = function(index) {
        vm.cart.splice(index, 1);
        vm.total = 0;
        for (var i in vm.cart) {
            vm.cart[i].subtotal = vm.cart[i].quantity * vm.cart[i].item.cena;
            vm.cart[i].subtotal = vm.cart[i].subtotal.toFixed(2);
            vm.total = parseFloat(vm.total) + parseFloat(vm.cart[i].subtotal);
        }
        vm.total = vm.total.toFixed(2);        
    };
    
});

