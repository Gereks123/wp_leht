<?php
/**
 * Plugin Name: my-first-plugin
 * Plugin URI: https://germaneksi.ikt.khk.ee/wordpress/
 * Description: This is my very first plugin I ever created.
 * Version 1.0
 * Author: German Eksi
 * Author URI: https://germaneksi.ikt.khk.ee/wordpress/
**/

// Replaces the excerpt "Read More" text by a link
function new_excerpt_more($more) {
       global $post;
    return '<a class="read-article" href="'. get_permalink($post->ID) . '"> Read the best article ever...</a>';
}
add_filter('excerpt_more', 'new_excerpt_more');