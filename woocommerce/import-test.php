<?php
/**
 * Test local uniquement (WordPress Playground) : importe le CSV avec l'importateur natif
 * de WooCommerce, en utilisant la même correspondance automatique des colonnes que
 * l'écran « Produits → Importer » de l'administration.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

include_once WC_ABSPATH . 'includes/admin/importers/class-wc-product-csv-importer-controller.php';
include_once WC_ABSPATH . 'includes/import/class-wc-product-csv-importer.php';

$file = __DIR__ . '/inahair-produits.csv';

// Correspondance automatique des colonnes (méthode protégée du contrôleur d'import).
$controller = new WC_Product_CSV_Importer_Controller();
$headers    = ( new WC_Product_CSV_Importer( $file, array( 'lines' => 1 ) ) )->get_raw_keys();
$auto_map   = new ReflectionMethod( $controller, 'auto_map_columns' );
$auto_map->setAccessible( true );
$mapping = $auto_map->invoke( $controller, $headers );

// Import par lots de 30 lignes, comme l'écran d'administration.
$result   = array( 'imported' => array(), 'updated' => array(), 'failed' => array(), 'skipped' => array() );
$position = 0;
$size     = filesize( $file );
do {
	$importer = new WC_Product_CSV_Importer(
		$file,
		array(
			'mapping'         => array_combine( $headers, $mapping ),
			'parse'           => true,
			'update_existing' => false,
			'start_pos'       => $position,
			'lines'           => 30,
		)
	);
	$batch = $importer->import();
	foreach ( $result as $k => $v ) {
		$result[ $k ] = array_merge( $v, $batch[ $k ] );
	}
	$position = $importer->get_file_position();
} while ( $position > 0 && $position < $size );

// Coupon de démonstration INAHAIR10 : -10 % sur perruques et tissages.
if ( ! wc_get_coupon_id_by_code( 'inahair10' ) ) {
	$coupon = new WC_Coupon();
	$coupon->set_code( 'INAHAIR10' );
	$coupon->set_discount_type( 'percent' );
	$coupon->set_amount( 10 );
	$cats = array();
	foreach ( array( 'Perruques', 'Boules de tissage' ) as $name ) {
		$term = get_term_by( 'name', $name, 'product_cat' );
		if ( $term ) {
			$cats[] = $term->term_id;
		}
	}
	$coupon->set_product_categories( $cats );
	$coupon->save();
}

file_put_contents(
	__DIR__ . '/import-result.json',
	wp_json_encode(
		array(
			'mapping'  => array_combine( $headers, $mapping ),
			'imported' => count( $result['imported'] ),
			'updated'  => count( $result['updated'] ),
			'failed'   => array_map( fn( $e ) => $e->get_error_message(), $result['failed'] ),
			'skipped'  => array_map( fn( $e ) => $e->get_error_message(), $result['skipped'] ),
		),
		JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
	)
);
