<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/home', function () {
    return Inertia::render('Home');
});

Route::get('/record', function () {
    return Inertia::render('Record');
});

Route::get('/report', function () {
    return Inertia::render('Report');
});
