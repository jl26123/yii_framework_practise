<?php

namespace app\modules\admin\controllers;

use Yii;
use app\modules\admin\models\Accounts;
use app\modules\admin\models\AccountsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AccountsController implements the CRUD actions for Accounts model.
 */
class ManagementController extends Controller
{

 /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
                ],
            ],
        ];
    }

    /**
     * Lists all Accounts models.
     * @return mixed
     */
    public function actionIndex()
    {
        $accounts = Accounts::find()->all();

        return $this->render('management', [
                'accounts' => $accounts,
                'test'=>$accounts[1]->getFullName(),
            ]);
    }



}
