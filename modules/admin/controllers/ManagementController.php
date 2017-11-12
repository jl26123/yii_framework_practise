<?php

namespace app\modules\admin\controllers;

use Yii;
use app\modules\admin\models\Accounts;
use app\modules\admin\models\AccountsSearch;
use app\modules\admin\AccountsSettings;
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
        $accounts = Accounts::find()
                    ->orderBy('first_name')
                    ->all();


        return $this->render('management', [
                'accounts' => $accounts,
                'test'=>$accounts[1]->fullName,
            ]);
    }

    public function actionAjaxEnable($is_enable)
    {
        $accounts = Accounts::find()
                ->where(['enabled'=>$is_enable])
                ->orderBy('first_name')
                ->all();

        $temp = array();
        $count =0;
        foreach($accounts as $account){
            $temp[$count]['id'] = $account->id;
            $temp[$count]['full_name'] = $account->fullName;
            $count++;
        } 
        /*return $this->render('debugView', [
                'info' =>json_encode($temp),
            ]);*/
        return json_encode($temp);
    }

    public function actionAjaxShowAccountInfo($id){
        $account = $this->findModel($id);
        $temp = $account->toArray();
        $temp = array_merge($temp,$account->accountsSetting->toArray());
        $groups[] =array();
        $count =0;
        foreach($account->groups as $group){
            $groups[$count]['id'] = $group->group_id;
            $groups[$count]['name'] = $group->groupName;
            $count++;
        }
        $temp['groups']= $groups;
        return json_encode($temp);
    }


    /**
     * Finds the Accounts model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Accounts the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Accounts::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }



}
