<?php
/**
 * Plugin Name: my first plugin
 * Plugin URI: https://germaneksi.ikt.khk.ee/wordpress/
 * Description: This is the very first plugin I ever created,
 * Version: 1.0
 * Author: German Eksi
 * Authot URI: https://germaneksi.ikt.khk.ee/wordpress/
**/

add_action( 'the_content', 'my_thank_you_text' );

function my_thank_you_text ( $content ) {
    return $content .= '<p>Thank you for reading!</p>';
}