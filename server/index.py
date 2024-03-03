from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import serial
import serial.tools.list_ports
import time

app = Flask(__name__)
CORS(app)

@app.route('/plotter/draw', methods=['POST', 'GET'])
def draw():
    # plotter_draw()
    params = request.get_json()
    if 'data' in params:
        gcode = params['data']

        send_gcode_plotter(gcode)
        return jsonify({
            "status": "starting",
            })
    else:
        return jsonify({"status": "error"})

@app.route('/plotter/list', methods=['POST', 'GET'])
def plotter_list_port():
        plotter_list = list_ports()
        return jsonify([p.name for p in plotter_list])


@app.route('/plotter/reset', methods=['POST', 'GET'])
def plotter_reset():
    #plotter_serial = plotter_setup() 
    ## wirte
    # plotter_serial.close()
    return jsonify({"status": "reset"})


def send_gcode_plotter(gcode):
    # Open g-code file
    plotter_serial = plotter_setup()
    # Stream g-code to grbl
    for line in gcode.split('\n'):
            l = line.strip()
            cmd = f'{l}'
            print(cmd)
            plotter_serial.write(cmd.encode()) # Send g-code block to grbl
            grbl_out = plotter_serial.readline() # Wait for grbl response with carriage return
            
    # Wait here until grbl is finished to close serial port and file.
    raw_input("Press <Enter> to exit and disable grbl.") 

    # Close file and serial port
    plotter_serial.close()

def plotter_setup():
    # Open serial
    p = get_plotter_port()
    s = serial.Serial(p, 115200)
    # Wake up grbl
    cmd = "\r\n"
    s.write(cmd.encode())
    time.sleep(2)   # Wait for grbl to initialize 
    s.flushInput()  # Flush startup text in serial input
    return s

def get_plotter_port():
        listPort = list_ports()
        if len(listPort) == 0:
                raise NotImplemented()
        return f'/dev/{listPort[0].name}'

def list_ports():
        return [port for port in serial.tools.list_ports.comports() if port[2] != 'n/a']

app.run(host='localhost', port=8888) 