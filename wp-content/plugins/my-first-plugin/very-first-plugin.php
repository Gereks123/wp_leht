<?php
/**
 * Plugin Name: my first plugin
 * Plugin URI: https://germaneksi.ikt.khk.ee/wordpress/
 * Description: This is the very first plugin I ever created,
 * Version: 1.0
 * Author: German Eksi
 * Authot URI: https://germaneksi.ikt.khk.ee/wordpress/
**/

function dh_modify_read_more_link() {

    return '<a class="more-link" href="' . get_permalink() . '">Click to Read!</a>';

}

add_filter( 'the_content_more_link', 'dh_modify_read_more_link' );