<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace app\assets;

use yii\web\AssetBundle;

/**
 * Main application asset bundle.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class DefaultAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
       	'css/plugin/jquery-ui-lightness/jquery-ui-1.10.4.custom.css',
		'css/plugin/jquery-fancybox/jquery.fancybox.css',
		'css/plugin/jquery-impromptu/jquery-impromptu.css',
		'css/plugin/jquery.jscrollpane.css',
		'css/plugin/jquery.scrollbar.css',
        'css/responsive.css',
        'css/main.css',
    ];
    public $js = [
        
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
    ];
}
