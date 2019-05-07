<?php
    header('Access-Control-Allow-Origin: *');

    require_once('class.DB.php');
    define('DB_NAME', 'gamescribe');
    define('DB_USER', 'DBuserNameGoesHere');
    define('DB_PASSWORD', 'DBpasswordGoesHere');
    define('DB_HOST', 'localhost');

    define('KEY_VALIDATION', true);
    define('DB_KEY_CHECK', 'games');

    define('API_POST_SIZE', 'maxPostSize');
    define('API_JOT_DOWN', 'jotDown');
    define('API_CHECK_KEY', 'checkGameKey');


    $db = new DB();
    $apiReceipt = array();

    //build array
    $gs = array();
    $apiReceipt['success'] = false;

    foreach ($_POST as $key => $value) {
        $gs[$key] = $value;
    }

    if (isset($gs['QA'])) {
        $db->setQA($gs['QA']);
    }

    if (isset($gs['gsVersion']) && isset($gs['apiAction'])) {
        $apiReceipt['gsVersion'] = $gs['gsVersion'];
        $apiReceipt['requestedAction'] = $gs['apiAction'];

        switch ($gs['gsVersion']) {
            case 'v1p1':
                switch ($gs['apiAction']) {
                    case 'jotDown':
                        if ($db->connected()) {
                            if (isset($gs['gameKey']) && $db->validateKey($gs['gameKey'])) {
                                $jotReceipt = $db->insertJot($gs);
                                if ($jotReceipt >= 0) {
                                    $apiReceipt['jotID'] = $gs['id'];
                                    $apiReceipt['sheetID'] = $gs['sheetKey'];
                                    $apiReceipt['success'] = true;
                                    $apiReceipt['ds'] = $jotReceipt;
                                }
                            }
                        }
                        break;
                }
                break;
            case 'v1p2':
                switch ($gs['apiAction']) {
                    case API_POST_SIZE:
                        $apiReceipt['maxBytes'] = $db->getMaxPostSize();
                        $apiReceipt['success'] = true;
                        break;
                    case API_JOT_DOWN:
                        if ($db->connected()) {
                            if (isset($gs['gameKey']) && $db->validateKey($gs['gameKey'])) {
                                $jots = json_decode($gs['jotSet']);
                                $jotsReceipt = $db->insertJots($jots, $gs['gameKey'], $gs['userID']);
                                $apiReceipt['sheetID'] = $gs['sheetKey'];
                                $apiReceipt['jotReceipts'] = $jotsReceipt;
                                $apiReceipt['jotCount'] = $gs['jotCount'];
                                $apiReceipt['success'] = true;
                            }
                        }
                        break;
                    case API_CHECK_KEY:
                        $apiReceipt['success'] = $db->validateKey($gs['gameKey']);
                        break;
                }
                break;
        }
    }
    echo json_encode($apiReceipt);
