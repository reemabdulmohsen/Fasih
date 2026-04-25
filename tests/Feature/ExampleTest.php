<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_home_page_is_available(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Fasih', false)
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Welcome')
            );
    }

    public function test_the_api_health_endpoint_returns_the_expected_payload(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'ok',
                'project' => 'Fasih',
            ]);
    }

    public function test_removed_breeze_routes_are_not_registered(): void
    {
        $this->get('/dashboard')->assertNotFound();
        $this->get('/login')->assertNotFound();
        $this->get('/register')->assertNotFound();
    }
}
